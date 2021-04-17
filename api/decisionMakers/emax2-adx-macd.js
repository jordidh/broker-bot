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
 *         { "name" : "EMA", "period" : 20 },
 *         { "name" : "EMA", "period" : 50 },
 *         { "name" : "ADX", "period" : 50 },
 *         { "name" : "MACD", "period" : 50 }
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
 *     { "name" : "DEMA", "period" : 50, "value" : 34 },
 *     { "name" : "ADX", "period" : 50, "value" : 34 },
 *     { "name" : "MACD", "period" : 50, "value" : 34 }
 *   ]
 * }
 * @param {*} currentData 
 * lastData = {
 *   market : "id",
 *   windowStart : 1614933060,
 *   windowEnd : 1614945000,
 *   indicatorValues : [
 *     { "name" : "DEMA", "period" : 20, "value" : 34 },
 *     { "name" : "DEMA", "period" : 50, "value" : 34 },
 *     { "name" : "ADX", "period" : 50, "value" : 34 },
 *     { "name" : "MACD", "period" : 50, "value" : 34 }
 *   ]
 * }
 * @param {*} lastAction:
 * {
 *      action: "", // última acció: "" quan és el primer cop o després d'un reinici / buy / sell / relax
 *      price: 0,   // preu de compra o venda de l'últinma acció
 * }
 */
exports.decide = function (market, lastData, currentData, lastAction) {
    let action = "relax";

    // Validem que l'estrategia de decisió correspon amb el decisionMarker
    if (market.strategy != "emax2-adx-macd") {
        throw new Error("strategy \"" + market.strategy + "\" incorrect and does not match with the decisionMarker provided");
    }

    // Algoritme de decisió
    // Suposem que compararem amb DEMA(10) i DEMA(20) 
    // Si DEMA(20) passa de sota a sobre de DEMA(10) venem, si passa de sobre a sota comprem.

    // Validem que siguin 2 índex, tots dos iguals i un amb un intervalmes gran que l'altre
    if (market.indicator.length != 4 || 
        market.indicator[0].name != market.indicator[1].name ||
        market.indicator[0].name != "EMA" ||
        market.indicator[2].name != "ADX" ||
        market.indicator[3].name != "MACD" ||
        market.indicator[0].period >= market.indicator[1].period) {

        throw new Error("indicators incorrect, strategy emax2-adx-macd must have 4 indicators (EMA, EMA ADX, MACD), the period of the 2n EMA must be grater than the first EMA");
    }

    // Suposem que el lastData.indicatorValues[0] és EMA(10) i el lastData.indicatorValues[1] és el EMA(20)
    let lastValuesDiff = lastData.indicatorValues[0].value - lastData.indicatorValues[1].value;
    let currentValuesDiff = currentData.indicatorValues[0].value - currentData.indicatorValues[1].value;
    // Cas 1: els valors anterior i actual tenen el mateix signe o tots dos són 0, no fem res, deixem action = "relax"
    // Cas 2: si són diferents mirem quin és negatiu i quin positiu 
    //        Explicació: el EMA(10) reacciona mes ràpid que el 20, per tant si puja comprem si baixa venem
    //        Quan el EMA(10) passa per sobre del EMA(20) => comprem
    //        Quan el EMA(10) passa per sota del EMA(20) => venem
    if (Math.sign(lastValuesDiff) != Math.sign(currentValuesDiff)) {
        if (Math.sign(lastValuesDiff) < Math.sign(currentValuesDiff)) {   
            // Anteriorment EMA(10) estava per sota i ara per sobre => comprem
            action = "buy";
        } else {
            // Anteriorment EMA(10) estava per sobre i ara per sota => venem
            action = "sell";
        }
    }

    return action;
}