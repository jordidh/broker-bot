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
 *     { "name" : "MACD", "period" : 50, "value" : 34 }
 *   ]
 * }
 * @param {*} currentData 
 * lastData = {
 *   market : "id",
 *   windowStart : 1614933060,
 *   windowEnd : 1614945000,
 *   indicatorValues : [
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
    if (market.strategy != "macd") {
        throw new Error("strategy \"" + market.strategy + "\" incorrect and does not match with the decisionMarker provided");
    }

    // Algoritme de decisió
    // Suposem que compararem amb DEMA(10) i DEMA(20) 
    // Si DEMA(20) passa de sota a sobre de DEMA(10) venem, si passa de sobre a sota comprem.

    // Validem que siguin 2 índex, tots dos iguals i un amb un intervalmes gran que l'altre
    if (market.indicator.length != 1 || 
        market.indicator[0].name != "MACD") {

        throw new Error("indicators incorrect, strategy macd must have 1 indicators (MACD)");
    }

    // Com decidim si comprar i vendre?
    // TODO

    return action;
}