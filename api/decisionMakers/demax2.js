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
 *         { "name" : "DEMA", "period" : 20 },
 *         { "name" : "DEMA", "period" : 50 }
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
 *     { "name" : "DEMA", "period" : 20, "value" : 34 },
 *     { "name" : "DEMA", "period" : 50, "value" : 34 }
 *   ]
 * }
 * @param {*} currentData 
 * lastData = {
 *   market : "id",
 *   windowStart : 1614933060,
 *   windowEnd : 1614945000,
 *   indicatorValues : [
 *     { "name" : "DEMA", "period" : 20, "value" : 34 },
 *     { "name" : "DEMA", "period" : 50, "value" : 34 }
 *   ]
 * }
 */
exports.decide = function (market, lastData, currentData) {
    let action = "relax";

    // Validem que l'estrategia de decisió correspon amb el decisionMarker
    if (market.strategy != "demax2") {
        throw new Error("strategy \"" + market.strategy + "\" incorrect and does not match with the decisionMarker provided");
    }

    // Algoritme de decisió
    // Suposem que compararem amb DEMA(10) i DEMA(20) 
    // Si DEMA(20) passa de sota a sobre de DEMA(10) venem, si passa de sobre a sota comprem.

    // Validem que siguin 2 índex, tots dos iguals i un amb un intervalmes gran que l'altre
    if (market.indicator.length != 2 || 
        market.indicator[0].name != market.indicator[1].name ||
        market.indicator[0].name != "DEMA" ||
        market.indicator[0].period >= market.indicator[1].period) {

        throw new Error("indicators incorrect, strategy demax2 must have 2, with the same name and the period of the 2n must be grater than the first");
    }

    // Suposem que el lastData.indicatorValues[0] és DEMA(10) i el lastData.indicatorValues[1] és el DEMA(20)
    let lastValuesDiff = lastData.indicatorValues[0].value - lastData.indicatorValues[1].value;
    let currentValuesDiff = currentData.indicatorValues[0].value - currentData.indicatorValues[1].value;
    // Cas 1: els valors anterior i actual tenen el mateix signe o tots dos són 0, no fem res, deixem action = "relax"
    // Cas 2: si són diferents mirem quin és negatiu i quin positiu 
    //        Explicació: el DEMA(10) reacciona mes ràpid que el 20, per tant si puja comprem si baixa venem
    //        Quan el DEMA(10) passa per sobre del DEMA(20) => comprem
    //        Quan el DEMA(10) passa per sota del DEMA(20) => venem
    if (Math.sign(lastValuesDiff) != Math.sign(currentValuesDiff)) {
        if (Math.sign(lastValuesDiff) < Math.sign(currentValuesDiff)) {   
            // Anteriorment DEMA(10) estava per sota i ara per sobre => comprem
            action = "buy";
        } else {
            // Anteriorment DEMA(10) estava per sobre i ara per sota => venem
            action = "sell";
        }
    }

    return action;
}