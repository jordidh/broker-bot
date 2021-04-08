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
    if (market.strategy != "bbands-stoch") {
        throw new Error("strategy \"" + market.strategy + "\" incorrect and does not match with the decisionMarker provided");
    }

    // Algoritme de decisió
    // Suposem que compararem amb DEMA(10) i DEMA(20) 
    // Si DEMA(20) passa de sota a sobre de DEMA(10) venem, si passa de sobre a sota comprem.

    // Validem que siguin 2 índex, tots dos iguals i un amb un intervalmes gran que l'altre
    if (market.indicator.length != 2 || 
        market.indicator[0].name != "BBANDS" ||
        market.indicator[1].name != "STOCH") {

        throw new Error("indicators incorrect, strategy bbands-stoch must have 2 indicators, BBANDS and STOCH");
    }

    // Mirem les bbands
    // Vendrem quan el preu de tancament de la espelma anterior sigui superior a la línia upper de la bbands
    let isClosePriceOverUpper = lastData.indicatorValues[0].value.upper < lastData.price;
    // Comprarem quan el preu de tancament de l'espelma anterior sigui inferior a la línia lower de la bbands
    let isClosePriceUnderLower = lastData.indicatorValues[0].value.lower > lastData.price;

    // Mirem el stoch
    let stochOver80 = lastData.indicatorValues[1].value >= 80;
    let stochUnder20 = lastData.indicatorValues[1].value <= 20;

    if (isClosePriceOverUpper === true && stochOver80 === true) {
        action = "sell";
    } else if (isClosePriceUnderLower === true && stochUnder20 === true) {
        action = "buy";
    }

    return action;
}