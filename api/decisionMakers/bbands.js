"use strict";

/**
 * Funció que pren una decisió a partir d'un mercat i de les dades actuals i anteriors
 * 
 * @param {*} market 
 * {
 *     "id" : "BTC",
 *     "api" : "https://api.kraken.com/0/public/OHLC?pair=BTCEUR&interval=5",
 *     "strategy" : "",    // nom de l'estrategia de decisió que aplicarem: p.e. "demax2"
 *     "decisionWindow" : "",
 *     "indicator" : [
 *         { "name" : "BBANDS", "period" : 20 }
 *     ],
 *     "tradingBots" : [
 *         {
 *             "url" : "http://localhost:4401",
 *             "token" : "TEST_TOKEN",
 *             "pair" : "BTC/EUR"
 *         }
 *     ]
 * }
 * @param {*} lastData 
 * lastData = {
 *   market : "id",
 *   windowStart : 1614933060,
 *   windowEnd : 1614945000,
 *   indicatorValues : [
 *     { "name" : "BBANDS", "period" : 20, "value" : { middle : 10, lower : 5, upper: 15 } }
 *   ]
 * }
 * @param {*} currentData 
 * lastData = {
 *   market : "id",
 *   windowStart : 1614933060,
 *   windowEnd : 1614945000,
 *   indicatorValues : [
 *     { "name" : "BBANDS", "period" : 20, "value" : { middle : 10, lower : 5, upper: 15 } }
 *   ]
 * }
 */
exports.decide = function (market, lastData, currentData) {
    let action = "relax";

    // Validem que l'estrategia de decisió correspon amb el decisionMarker
    if (market.strategy != "bbands") {
        throw new Error("strategy \"" + market.strategy + "\" incorrect and does not match with the decisionMarker provided");
    }

    // Algoritme de decisió
    // Suposem que compararem amb DEMA(10) i DEMA(20) 
    // Si DEMA(20) passa de sota a sobre de DEMA(10) venem, si passa de sobre a sota comprem.

    // Validem que siguin 2 índex, tots dos iguals i un amb un intervalmes gran que l'altre
    if (market.indicator.length != 1 || 
        market.indicator[0].name != "BBANDS") {

        throw new Error("indicators incorrect, strategy bbands must have 2, with the same name and the period of the 2n must be grater than the first");
    }

    let lastValuesLowerUpperDiff = lastData.indicatorValues[0].value.upper - lastData.indicatorValues[0].value.lower;
    let currentValuesLowerUpperDiff = currentData.indicatorValues[0].value.upper - currentData.indicatorValues[0].value.lower;

    let lowerUpperDiff = currentValuesLowerUpperDiff - lastValuesLowerUpperDiff;
    let middleDiff = currentData.indicatorValues[0].value.middle - lastData.indicatorValues[0].value.middle;

    if (middleDiff > 0) {
        // Si la gràfica de middle puja i la diferència entre upper i lower augmenta => comprem
        if (lowerUpperDiff > 0) {
            action = "buy";
        }
    } else {
        // Si la gràfica de middle baixa i la diferència entre upper i lower disminueix => venem
        if (lowerUpperDiff < 0) {
            action = "sell";
        }
    }

    return action;
}