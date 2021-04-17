"use strict";

/**
 * Funció basada en els indicadors BBDANS i STOCH per saber quan comprar i vendre
 * Es customitza amb elsegüent algoritme:
 * 1. Inicialment s'espera a fer una compra quan BBANDS i STOCH ens indiquin que hi ha sobrevenda
 * 2. Si l'última acció va ser compar identifiquem si hem de vendre quan es compleixi alguna de les següents condicions:
 *      2.1. Si BBANDS i STOCH ens indiquen que hi ha sobrecompra i hem superat el marge de la comissió => venem
 *      2.2. Si hi ha una caiguda forta (BBANDS i STOCH indiquen sobrecompra) i hem igualat o superat al límit inferior marcat com a venda => venem
 * 3. Si l'última acció va ser vendre identifiquem si hem de comprar quan es compleixi alguna de les següents condicions:
 *      3.1. Si BBANDS i STOCH ens indiquen que hi ha sobrevenda => comprem
 * 
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
 * @param {*} lastAction: última acció presa 
 * {
 *      action: "", // última acció: "" quan és el primer cop o després d'un reinici / buy / sell / relax
 *      price: 0,   // preu de compra o venda de l'últinma acció
 * }
 */
exports.decide = function (market, lastData, currentData, lastAction) {
    let action = "relax";

    // Validem que l'estrategia de decisió correspon amb el decisionMarker
    if (market.strategy != "bbands-stoch-custom-01") {
        throw new Error("strategy \"" + market.strategy + "\" incorrect and does not match with the decisionMarker provided");
    }

    // Algoritme de decisió
    // Suposem que compararem amb DEMA(10) i DEMA(20) 
    // Si DEMA(20) passa de sota a sobre de DEMA(10) venem, si passa de sobre a sota comprem.

    // Validem que siguin 2 índex, tots dos iguals i un amb un intervalmes gran que l'altre
    if (market.indicator.length != 2 || 
        market.indicator[0].name != "BBANDS" ||
        market.indicator[1].name != "STOCH") {

        throw new Error("indicators incorrect, strategy bbands-stoch-custom-01 must have 2 indicators, BBANDS and STOCH");
    }

    // Mirem les bbands per saber si estàsobrecomprat (quan hi ha preus per sobre de la línia superior) 
    // o sobrevenut (quan hi hapreus per sota de la línia inferior)
    let isClosePriceOverUpper = lastData.indicatorValues[0].value.upper < lastData.price;
    let isClosePriceUnderLower = lastData.indicatorValues[0].value.lower > lastData.price;

    // Mirem l'stoch per saber si està sobrecomprat (>=80%) o sobrevenut (<=20%)
    let stochOver80 = lastData.indicatorValues[1].value >= 80;
    let stochUnder20 = lastData.indicatorValues[1].value <= 20;

    // 1. Inicialment s'espera a fer una compra quan BBANDS i STOCH ens indiquin que hi ha sobrevenda
    // 2. Si l'última acció va ser compar identifiquem si hem de vendre quan es compleixi alguna de les següents condicions:
    //     2.1. Si BBANDS i STOCH ens indiquen que hi ha sobrecompra i hem superat el marge de la comissió => venem
    //     2.2. Si hi ha una caiguda forta (BBANDS i STOCH indiquen sobrecompra) i hem igualat o superat al límit inferior marcat com a venda => venem
    // 3. Si l'última acció va ser vendre identifiquem si hem de comprar quan es compleixi alguna de les següents condicions:
    //     3.1. Si BBANDS i STOCH ens indiquen que hi ha sobrevenda => comprem
    switch(lastAction.action) {
        case "":
        case "relax":
            if (isClosePriceUnderLower === true && stochUnder20 === true) {
                // Comprarem quan el preu de tancament de l'espelma anterior sigui inferior a la línia lower de la bbands
                // i stoch ens indiqui que està sobrevenuts (oversold)
                action = "buy";
            }
            break;
        case "buy":
            if (isClosePriceOverUpper === true && stochOver80 === true) {
                let sellPriceMinusComission = lastData.price - (lastData.price * market.comission[1] / 100);
                // Si he superat el preu de compra mes el marge de la comissió per la venda => venem
                // o
                // si el preu actual està per sota del límit inferior que tenim marcat => venem per no perdre mes
                if (sellPriceMinusComission >= lastAction.price || 
                    price <= market.emergencyLimitMin) {
                    action = "sell";
                }
            }
            break;
        case "sell":
            if (isClosePriceUnderLower === true && stochUnder20 === true) {
                action = "buy";
            }
            break;
        default:
            throw new Error("lastAction.action unexpected, allowed values are sell/buy/relax/string.empty");
    }

    return action;
}