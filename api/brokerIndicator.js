"use strict";

/**
 * Funció que calcula el SMA d'un array de valors: és la mitjana (la suma dividida pel número de valors)
 * @param {*} prices : array de preus sobre el que es calcularà el SMA
 *                     Ex: [
 *                       [val1, val2, val3, ....],
 *                       ...
 *                     ]
 * @param {*} timeIndex: index a dins de l'array per saber quin és el valor que conté la data i hora
 * @param {*} priceIndex: index a dins de l'array per saber quin és el valor sobre el que hem de calcular
 * @param {*} period : periòde de temps sobre el que es calcularà el SMA 
 */
exports.SimpleMovingAverage = async function(prices, timeIndex, priceIndex, period) {
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

        let sma = new Array(prices.length);
        for (let i = 0; i < prices.length; i++) {
            let currentSMA = 0;

            if (i >= period) {
                //console.log("value " + i);
                for (let j = i - period; j < i; j++) {
                    //console.log("j(" + j + ")=" + prices[j][priceIndex]);
                    currentSMA += prices[j][priceIndex];
                }
            } 
            sma[i] = [prices[i][timeIndex], currentSMA / period];
        }

        return {
            "error" : [],
            "result" : sma
        }
    } catch(e) {
        return { "error" : [ "exception: " + e.message ], "result" : { } }
    }
}

/**
 * Funció que calcula el EMA d'un array de valors: és una mitjana que afavoriex els preus mes recents
 * ​EMA Today = (Value Today ∗ a) + (EMA Yesterday ∗ (1 − a) )
 * @param {*} prices : array de preus sobre el que es calcularà el SMA
 *                     Ex: [
 *                       [val1, val2, val3, ....],
 *                       ...
 *                     ]
 * @param {*} timeIndex: index a dins de l'array per saber quin és el valor que conté la data i hora
 * @param {*} priceIndex: index a dins de l'array per saber quin és el valor sobre el que hem de calcular
 * @param {*} period : periòde de temps sobre el que es calcularà el EMA 
 */
exports.ExponentialMovingAverage = async function(prices, timeIndex, priceIndex, period) {
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

        let a = 2 / (period + 1);

        let ema = new Array(prices.length);
        for (let i = 0; i < prices.length; i++) {
            let currentEma = 0;

            if (i >= period) {
                // En el primer càlcul substituim el EMA(t-1) per l'SMA
                if (i === period) {
                    // Calculem l'SMA
                    let currentSMA = 0;
                    for (let j = i - period; j < i; j++) {
                        currentSMA += prices[j][priceIndex];
                    }
                    // Guardem SMA com a EMA
                    currentEma = (currentSMA / period);
                } else {
                    // Calculem l'EMA
                    //console.log("price=" + prices[i][priceIndex] + ", ema(t-1)=" + ema[ema.length - 1][1]);
                    currentEma = (a * prices[i][priceIndex]) + ((1 - a) * ema[i - 1][1]);
                }
            }
            
            //console.log(currentEma);
            //ema.push([prices[i][timeIndex], currentEma]);
            ema[i] = [prices[i][timeIndex], currentEma];
        }

        return {
            "error" : [],
            "result" : ema
        }
    } catch(e) {
        return { "error" : [ "exception: " + e.message ], "result" : { } }
    }
}

/**
 * Funció que calcula el DEMA d'un array de valors: és una mitjana que afavoriex els preus mes recents
 * D​EMA(t) = 2 * EMA(t) - EMA(EMA(t))
 * @param {*} prices : array de preus sobre el que es calcularà el SMA
 *                     Ex: [
 *                       [val1, val2, val3, ....],
 *                       ...
 *                     ]
 * @param {*} timeIndex: index a dins de l'array per saber quin és el valor que conté la data i hora
 * @param {*} priceIndex: index a dins de l'array per saber quin és el valor sobre el que hem de calcular
 * @param {*} period : periòde de temps sobre el que es calcularà el DEMA 
 */
exports.DoubleExponentialMovingAverage = async function(prices, timeIndex, priceIndex, period) {
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

        let a = 2 / (period + 1);

        let dema = new Array(prices.length);
        let lastEma = 0;
        for (let i = 0; i < prices.length; i++) {
            let currentDema = 0;
            let currentEma = 0;
            let currentEma2 = 0;
            if (i >= period) {
                // En el primer càlcul substituim el EMA(t-1) per l'SMA
                if (i === period) {
                    // Calculem l'SMA
                    let currentSMA = 0;
                    for (let j = i - period; j < i; j++) {
                        currentSMA += prices[j][priceIndex];
                    }
                    // Guardem SMA com a EMA
                    currentEma = (currentSMA / period);
                    currentEma2 = (a * currentEma) + ((1 - a) * currentEma);
                    lastEma = currentEma;
                } else {
                    // Calculem l'EMA
                    //console.log("price=" + prices[i][priceIndex] + ", ema(t-1)=" + ema[ema.length - 1][1]);
                    //currentEma = (a * prices[i][priceIndex]) + ((1 - a) * dema[i - 1][1]);
                    currentEma = (a * prices[i][priceIndex]) + ((1 - a) * lastEma);
                    currentEma2 = (a * currentEma) + ((1 - a) * lastEma);
                    lastEma = currentEma;
                }
                currentDema = (2 * currentEma) - currentEma2;
            }
            dema[i] = [prices[i][timeIndex], currentDema];
        }

        //console.log(dema);

        return {
            "error" : [],
            "result" : dema
        }
    } catch(e) {
        return { "error" : [ "exception: " + e.message ], "result" : { } }
    }
}
