"use strict";

//const {SMA, EMA} = require('trading-signals');
const Big = require('big.js');
const tradingSignals = require('trading-signals');
const { BollingerBands } = require('trading-signals');
const axios = require('axios');
const https = require('https');

/**
 * Funció que calcula el l'indicador especificat d'un array de valors
 * Retorna una cosa de l'estil: { 
 *   "error" : [],
 *   "result" : [ [time, value], ...]
 * }
 * @param {*} prices : array de preus sobre el que es calcularà el SMA
 *                     Ex: [
 *                       [val1, val2, val3, ....],
 *                       ...
 *                     ]
 * @param {*} indicator : indicador que s'aplicarà ("SMA", "EMA", "DEMA")
 * @param {*} period : periòde de temps sobre el que es calcularà las senyal
 * @param {*} timeIndex: index a dins de l'array per saber quin és el valor que conté la data i hora
 * @param {*} priceIndex: index a dins de l'array per saber quin és el valor sobre el que hem de calcular
 */
exports.applyIndicator = async function(prices, indicator, period, timeIndex, priceIndex) {
    try {
        if (typeof period === "undefined" || isNaN(parseInt(period)) || parseInt(period) != period) {
            return { "error" : [ "error in parameter period, must be an integer" ], "result" : { } }
        }
        if (typeof priceIndex === "undefined" || isNaN(parseInt(priceIndex)) || parseInt(priceIndex) != priceIndex) {
            return { "error" : [ "error in parameter priceIndex, must be an integer " + priceIndex ], "result" : { } }
        }
        if (typeof prices === "undefined" || !Array.isArray(prices)) {
            return { "error" : [ "error in parameter prices, must be an array" ], "result" : { } }
        }
        if (prices.length <= period) {
            return { "error" : [ "error, prices array length must be greater than the period" ], "result" : { } }
        }


        let result = new Array(prices.length);

        let currentIndicator = null;
        switch(indicator) {
            case "SMA":  // Simple Moving Average (SMA) => tested OK
                currentIndicator = new tradingSignals.SMA(period);
                break;
            case "EMA": // Exponential Moving Average (EMA) =>  tested OK
                currentIndicator = new tradingSignals.EMA(period);
                break;
            case "DEMA": // Double Exponential Moving Average (DEMA) => tested OK
                currentIndicator = new tradingSignals.DEMA(period);
                break;
            case "ABANDS": //Acceleration Bands (ABANDS)
                currentIndicator = new tradingSignals.AccelerationBands(period);
                break;
            case "ADX": // Average Directional Index (ADX)
                currentIndicator = new tradingSignals.ADX(period);
                break;
            case "ATR": // Average True Range (ATR)
                currentIndicator = new tradingSignals.ATR(period);
                break;
            case "BBANDS": //Bollinger Bands (BBANDS)
                currentIndicator = new tradingSignals.BollingerBands(period);
                break;
            case "CG": // Center of Gravity (CG)
                currentIndicator = new tradingSignals.CG(period);
                break;
            case "DMA": // Double Moving Average (DMA)
                currentIndicator = new tradingSignals.DMA(period);
                break;
            case "MACD": // Moving Average Convergence Divergence (MACD)
                currentIndicator = new tradingSignals.MACD(period);
                break;
            case "ROC": // Rate-of-Change (ROC)
                currentIndicator = new tradingSignals.ROC(period);
                break;
            case "RSI": // Relative Strength Index (RSI)
                currentIndicator = new tradingSignals.RSI(period);
                break;
            case "SMMA": // Smoothed Moving Average (SMMA)
                currentIndicator = new tradingSignals.SMMA(period);
                break;
            default:
                return { "error" : [ "Indicador " + indicator + " no implementat" ], "result" : { } }
        }

        prices.forEach((price, index) => {
            currentIndicator.update(new Big(price[priceIndex]));

            if (index >= period - 1) {
            //if (currentIndicator.isStable) {
                result[index] = [prices[index][timeIndex], currentIndicator.getResult().toNumber()];
            } else {
                result[index] = [prices[index][timeIndex], 0];
            }


            //result[index] = currentIndicator.getResult().toNumber();

            //if (index > period) {
            //    result[index] = [prices[index][timeIndex], currentIndicator.getResult().toNumber()];
            //} else {
            //    result[index] = [prices[index][timeIndex], 0];
            //}
        });

        return {
            "error" : [],
            "result" : result
        }
    } catch(e) {
        return { "error" : [ "exception: " + e.message ], "result" : { } }
    }
}

/**
 * 
 * @param {*} market 
 * {
 *     "id" : "BTC",
 *     "api" : "https://api.kraken.com/0/public/OHLC?pair=BTCEUR&interval=5",
 *     "strategy" : "",
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
 * @param {*} lastData : ultimes dades guardades a la BD, ens han de permetre decidir 
 *                       que fer segons les dates que es calcuin amb les dades actuals
 * lastData = {
 *   market : "id",
 *   windowStart : 1614933060,
 *   windowEnd : 1614945000,
 *   indicatorValues : [
 *     { "name" : "DEMA", "period" : 20, "value" : 34 },
 *     { "name" : "DEMA", "period" : 50, "value" : 34 }
 *   ]
 * }
 * @param {*} prices : preus sobre els que es calcularà l'indicador
 * [
 *    1614811800,    <--- unixtime
 *    42020.0,     <--- obertura
 *    42125.1,     <--- màxim
 *    41980.0,     <--- mínim
 *    42006.9     <--- tancament
 * ]
 * 
 * Retorna una cosa del tipus: {
 *   "error" : [],
 *   "result" : {
  *     "currentData" : {
 *          market : "id",
 *          windowStart : 1614933060,
 *          windowEnd : 1614945000,
 *          price : 34,
 *          indicatorValues : [
 *              { "name" : "DEMA", "period" : 20, "value" : 34 },
 *              { "name" : "DEMA", "period" : 50, "value" : 34 }
 *          ],
 *          decision : "buy" / "sell" / "relax"
 *      }
 *    }
 * }
 */
exports.checkAndDecide = async function(market, lastData, prices) {
    /*
    // Si lastData no té un valor correcte sortim
    if (typeof lastData === "undefined") {
        return {
            "error" : [ "parameter lastData is not valid" ],
            "result" : {}
        }
    }
    */

    // Configurem el resultat amb les dades que tenim actualment
    let currentData = {
        market : market.id,
        windowStart : (lastData && lastData.windowEnd ? lastData.windowEnd : 0),
        windowEnd : Math.floor(new Date().getTime() / 1000),
        indicatorValues : []  // faltarà posar valors als indicadors
    }

    // Per cada indicador, l'apliquem a les dades i ens quedem amb l'últim valor
    for (let i = 0; i < market.indicator.length; i++) {
        // Apliquem l'indicador sobre el preu al tancament (índex 4)
        let indicator = await this.applyIndicator(prices, market.indicator[i].name, market.indicator[i].period, 0, 4);

        //console.log(indicator);

        if (indicator.error.length > 0) {
            return {
                "error" : [ "Error in applyIndicator with indicator " + market.indicator[i].name + ": " + indicator.error[0] ],
                "result" : { }
            }
        }

        // Guardem el valor final a currentData.
        currentData.indicatorValues.push({
            "name" : market.indicator[i].name,
            "period" : market.indicator[i].period,
            "value" : indicator.result[indicator.result.length - 1][1]    // index 0 és el time, 1 és el valor
        });
    }    

    // Si lastData està buit fem els càlculs però no prenem cap decisió, esperem que tingui dades
    let action = "relax";

    // Si lastData té valor comparem per determinar quina acció prenem
    if (lastData) {
        // Algoritme de decisió
        // Suposem que compararem amb DEMA(10) i DEMA(20) 
        // Si DEMA(20) passa de sota a sobre de DEMA(10) venem, si passa de sobre a sota comprem.

        // Validem que siguin 2 índex, tots dos iguals i un amb un intervalmes gran que l'altre
        if (market.indicator.length != 2 || 
            market.indicator[0].name != market.indicator[1].name &&
            market.indicator[0].period >= market.indicator[1].period) {
            return {
                "error" : [ "indicators incorrect, must have 2, with the same name and the period of the 2n must be grater than the first" ],
                "result" : null
            }
        }

        let lastValuesDiff = lastData.indicatorValues[0].value - lastData.indicatorValues[1].value;
        let currentValuesDiff = currentData.indicatorValues[0].value - currentData.indicatorValues[1].value;
        // Cas 1: els valors anterior i actual tenen el mateix signe o tots dos són 0, no fem res, deixem action = "relax"
        // Cas 2: si són diferents mirem quin és negatiu i quin positiu
        if (Math.sign(lastValuesDiff) != Math.sign(currentValuesDiff)) {
            if (Math.sign(lastValuesDiff) < Math.sign(currentValuesDiff)) {
                action = "sell";
            } else {
                action = "buy";
            }
        }
    }

    return {
        "error" : [ ],
        "result" : {
            "action" : action,
            "currentData" : currentData
        }
    }
}

/**
 * Funció que fa una crida a l'exchange i retorna els últims preus de la currenci seleccionada
 * @param {*} url : https://api.kraken.com/0/public/OHLC?pair=BTCEUR&interval=5&since=1615535000  // retorna en intervals de 5 minusts desde 1615535100 (des del 
 */
exports.getPricesFromURL = async function(url) {
    try {
        // Esperem rebre una cosa de l'estil:
        //{
        //   error: [ ],
        //   result: {
        //      XXBTZEUR: [    <--- Pair name
        //        [
        //          1614811800,    <--- unixtime
        //          "42020.0",     <--- obertura
        //          "42125.1",     <--- màxim
        //          "41980.0",     <--- mínim
        //          "42006.9",     <--- tancament
        //          "42019.5",     <--- vwap
        //          "16.80880356", <--- volum
        //          173            <--- comptador
        //        ],
        //         ...
        // Per poder mostrar-ho en el gràfic l'haurem de convertir a una cosa semblant a:
        //      [
        //        [
        //          1614811800,    <--- unixtime
        //          42020.0,     <--- obertura
        //          42125.1,     <--- màxim
        //          41980.0,     <--- mínim
        //          42006.9     <--- tancament
        //        ],
        //        ...
        // https://api.kraken.com/0/public/OHLC?pair=BTCEUR&interval=5&since=1615535000  // retorna en intervals de 5 minusts desde 1615535100 (des del 

        try {
            const response = await axios.get(url);
            // Si hi ha un error retornem
            if (response.data.error.length > 0) {
                return {
                    "error" : response.error,
                    "result" : null
                }
            }

            // Obtenim l'array de preus del resultat obtingut
            let prices = response.data.result[Object.keys(response.data.result)[0]];

            return {
                "error" : [ ],
                "result" : prices
            }
        } catch (err) {
            return {
                "error" : [ "Exception getting prices " + err.message ],
                "result" : null
            }
        }
    } catch (e) {
        return {
            "error" : [ "Exception getting prices ", e.message ],
            "result" : null
        }
    }
}

/**
 * Funció que fa un post al trading bot per ordenar una compra o venda
 * @param {*} bot : objecte del tipus {
 *       "url" : "http://localhost:4401",
 *       "token" : "TEST_TOKEN",
 *       "pair" : "BTC/EUR"
 *   }
 * @param {*} action : "sell" / "buy"
 */
exports.postToTradingBot = async function(bot, action) {
    try {
        axios.post(bot.url, {
            action : action,
            token : bot.token,
            pair : bot.pair
        }).then(res => {
            //console.log(res);
            return {
                "error" : [ ],
                "result" : res
            }
        }).catch(err => {
            //console.error(err);
            return {
                "error" : [ "Exception posting to trading-bot ", err.message ],
                "result" : null
            }
        });
    } catch (e) {
        return {
            "error" : [ "Exception getting prices ", e.message ],
            "result" : null
        }
    }
}