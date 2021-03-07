"use strict";

//const {SMA, EMA} = require('trading-signals');
const Big = require('big.js');
const tradingSignals = require('trading-signals');
const { BollingerBands } = require('trading-signals');

/**
 * Funció que calcula el l'indicador especificat d'un array de valors
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
exports.ApplyIndicator = async function(prices, indicator, period, timeIndex, priceIndex) {
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
                currentIndicator = new tradingSignals:BollingerBands(period);
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