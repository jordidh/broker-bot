"use strict";

const {SMA, EMA} = require('trading-signals');
const Big = require('big.js');
const tradingSignals = require('trading-signals');
const { BollingerBands } = require('trading-signals');
const Stoch = require('./indicators/stoch.js');
const axios = require('axios');
const https = require('https');

const DATA_TIMESTAMP_INDEX = 0;  // Índex que ocupa el valor de timestamp dins de l'array de dades
const DATA_PRICE_INDEX = 4; // Índex que ocupa el valor del preu dins de l'array de dades

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
 * [
 *    1614811800,    <--- unixtime
 *    42020.0,     <--- obertura
 *    42125.1,     <--- màxim
 *    41980.0,     <--- mínim
 *    42006.9     <--- tancament
 * ]
 * @param {*} indicator : indicador que s'aplicarà ("SMA", "EMA", "DEMA")
 * @param {*} period : periòde de temps sobre el que es calcularà las senyal
 * @param {*} timeIndex: index a dins de l'array per saber quin és el valor que conté la data i hora
 * @param {*} priceIndex: index a dins de l'array per saber quin és el valor sobre el que hem de calcular
 *                        Alguns index necessiten high ilow que seran priceIndex-2 i priceIndex-1
 */
exports.applyIndicator = async function(prices, indicator, period, timeIndex, priceIndex) {
    try {
        if (typeof period === "undefined") {
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
                if (isNaN(parseInt(period)) || parseInt(period) != period) {
                    return { "error" : [ "error in parameter period, must be an integer" ], "result" : { } }
                }
                currentIndicator = new tradingSignals.SMA(period);
                break;
            case "EMA": // Exponential Moving Average (EMA) =>  tested OK
                if (isNaN(parseInt(period)) || parseInt(period) != period) {
                    return { "error" : [ "error in parameter period, must be an integer" ], "result" : { } }
                }
                currentIndicator = new tradingSignals.EMA(period);
                break;
            case "DEMA": // Double Exponential Moving Average (DEMA) => tested OK
                if (isNaN(parseInt(period)) || parseInt(period) != period) {
                    return { "error" : [ "error in parameter period, must be an integer" ], "result" : { } }
                }
                currentIndicator = new tradingSignals.DEMA(period);
                break;
            case "ABANDS": //Acceleration Bands (ABANDS)
                if (isNaN(parseInt(period)) || parseInt(period) != period) {
                    return { "error" : [ "error in parameter period, must be an integer" ], "result" : { } }
                }
                currentIndicator = new tradingSignals.AccelerationBands(period);
                break;
            case "ADX": 
                // Average Directional Index (ADX)
                // El ADX oscila entre 0 y 100
                // Com s'utilitza: 
                //      Cuando el ADX es mayor que 30, el mercado se encuentra en una tendencia fuerte, 
                //      cuando está entre 20 y 30 no está bien definido y cuando es menor a 20 indica 
                //      que el mercado está en rango. Las formas más comunes de utilizar el ADX son:
                //          1. Conocer la fuerza de una tendencia: Cuando el ADX tiene pendiente positiva y/o se sitúa en niveles entre 30 y 40 indica fortaleza de tendencia. En movimientos de tendencia fuerte (ya sea alcista o bajista) el especulador aprovecha las correcciones a la baja (en tendencia alcista) para comprar el valor y los rebotes (en tendencia bajista).
                //          2. Para saber cuando un rango llega a su fin: Cuando el ADX se encuentra por debajo de 20-30 y/o se encuentra entre las líneas de movimiento direccional. Con los precios en rango, los especuladores compran en la parte inferior y venden en la superior, el ADX les permite saber cuando ese rango se termina. Además, la señal de que un rango termina significa que comienza una nueva tendencia, por lo que especulador solo tendrá que subirse a ésta.
                //          3. Determinar cambios de tendencia: Cuando existen divergencias demasiado altas (por encima de 45-50) quiere decir que la tendencia se está agotando o está perdiendo fuerza. Por lo que probablemente se tome un respiro. Por el contrario, cuando estas divergencias se encuentran por encima de 30, pero en lecturas no muy altas entendemos que la tendencia se está fortaleciendo.
                // Per ADX es necessari proporcionar high price, low price i price at close
                // Ex: adxi.update({"high": 30.1983, "low": 29.4072, "close": 29.872});
                // "high" = price[priceIndex - 2], "low" : price[priceIndex - 1], "close" : price[priceIndex]
                if (isNaN(parseInt(period)) || parseInt(period) != period) {
                    return { "error" : [ "error in parameter period, must be an integer" ], "result" : { } }
                }
                currentIndicator = new tradingSignals.ADX(period);
                break;
            case "ATR": // Average True Range (ATR)
                if (isNaN(parseInt(period)) || parseInt(period) != period) {
                    return { "error" : [ "error in parameter period, must be an integer" ], "result" : { } }
                }
                currentIndicator = new tradingSignals.ATR(period);
                break;
            case "BBANDS": //Bollinger Bands (BBANDS)
                if (isNaN(parseInt(period)) || parseInt(period) != period) {
                    return { "error" : [ "error in parameter period, must be an integer" ], "result" : { } }
                }
                currentIndicator = new tradingSignals.BollingerBands(period);
                break;
            case "CG": // Center of Gravity (CG)
                if (isNaN(parseInt(period)) || parseInt(period) != period) {
                    return { "error" : [ "error in parameter period, must be an integer" ], "result" : { } }
                }
                currentIndicator = new tradingSignals.CG(period);
                break;
            case "DMA": // Double Moving Average (DMA)
                if (isNaN(parseInt(period)) || parseInt(period) != period) {
                    return { "error" : [ "error in parameter period, must be an integer" ], "result" : { } }
                }
                currentIndicator = new tradingSignals.DMA(period);
                break;
            case "MACD": 
                if (period.hasOwnProperty('longInterval') === false || 
                    period.hasOwnProperty('shortInterval') === false || 
                    period.hasOwnProperty('signal') === false) {
                    return { "error" : [ "error in parameter period, must be an object with properties longInterval, shortInterval and signal" ], "result" : { } }
                }
                // Moving Average Convergence Divergence (MACD): 
                // Indica la fortalesa dels moviments del preu
                // Permet decidir els moviments mes adecuats per comprar o vendre
                // Es compon de dues línies (MACD i senyal) i un histograma
                // Com es calcula: 
                // - Es calcula el MACD amb la fòrmula: MACD = EMA(període petit) - EMA(període llarg)
                // - Es calcula la senyal: la mitjana mòbil exponencial amb un altre període.
                // Com s'utilitza: Es visualitza les dues gràfiques (MACD i senyal) i l'histograma resultata de restar MACD - senyal
                //                 Quan es creuen les senyals hi ha un canvi de mercat, si l'histograma és positiu el mercat és alcista,
                //                 i si és negatiu és baixista
                currentIndicator = new tradingSignals.MACD({
                    indicator: EMA,
                    longInterval: period.longInterval,
                    shortInterval: period.shortInterval,
                    signalInterval: period.signal
                });
                break;
            case "ROC": // Rate-of-Change (ROC)
                if (isNaN(parseInt(period)) || parseInt(period) != period) {
                    return { "error" : [ "error in parameter period, must be an integer" ], "result" : { } }
                }
                currentIndicator = new tradingSignals.ROC(period);
                break;
            case "RSI": // Relative Strength Index (RSI)
                if (isNaN(parseInt(period)) || parseInt(period) != period) {
                    return { "error" : [ "error in parameter period, must be an integer" ], "result" : { } }
                }
                currentIndicator = new tradingSignals.RSI(period);
                break;
            case "SMMA": // Smoothed Moving Average (SMMA)
                if (isNaN(parseInt(period)) || parseInt(period) != period) {
                    return { "error" : [ "error in parameter period, must be an integer" ], "result" : { } }
                }
                currentIndicator = new tradingSignals.SMMA(period);
                break;
            case "STOCH": //
                if (isNaN(parseInt(period)) || parseInt(period) != period) {
                    return { "error" : [ "error in parameter period, must be an integer" ], "result" : { } }
                }
                currentIndicator = new Stoch(period);
                break;
            default:
                return { "error" : [ "Indicador " + indicator + " no implementat" ], "result" : { } }
        }

        prices.forEach((price, index) => {

            switch(indicator) {
                case "ADX":
                case "STOCH":
                    // Hem d'actualitzar amb diversos preus: {"high": 30.1983, "low": 29.4072, "close": 29.872}
                    currentIndicator.update({
                        "high" : price[priceIndex - 2],
                        "low" : price[priceIndex - 1],
                        "close" : price[priceIndex]
                    });
                    break;
                default:
                    currentIndicator.update(new Big(price[priceIndex]));
                    break;
            }
            
            //currentIndicator.update(price[priceIndex]);

            switch(indicator) {
                case "MACD":
                    // Pel motiu que sigui pel MACD no mirem si es estable
                    // getResult() retorna l'objecte { histogram: N, macd : M, signal : L }
                    let values = currentIndicator.getResult();
                    result[index] = [prices[index][timeIndex], { 
                        histogram : values.histogram.toNumber(),
                        macd : values.macd.toNumber(), 
                        signal : values.signal.toNumber() } ];
                    break;
                case "BBANDS":
                    if (index >= period - 1 && currentIndicator.isStable) {
                        const {middle, upper, lower} = currentIndicator.getResult();
                        result[index] = [prices[index][timeIndex], { middle : middle.toNumber(), upper : upper.toNumber(), lower : lower.toNumber()} ];
                    } else {
                        result[index] = [prices[index][timeIndex], { middle : 0, upper : 0, lower : 0} ];
                    }
                    break;
                case "STOCH":
                    if (index >= period - 1 && currentIndicator.isStable) {
                        result[index] = [prices[index][timeIndex], currentIndicator.getResult()];
                    } else {
                        result[index] = [prices[index][timeIndex], 0];
                    }
                    break;
                default:
                    if (index >= period - 1 && currentIndicator.isStable) {
                        result[index] = [prices[index][timeIndex], currentIndicator.getResult().toNumber()];
                    } else {
                        result[index] = [prices[index][timeIndex], 0];
                    }
                    break;
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
exports.checkAndDecide = async function(market, lastData, prices, decisionMaker) {
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
        price  : 0,
        decision : "relax",
        windowStart : (lastData && lastData.windowEnd ? lastData.windowEnd : 0),
        windowEnd : prices[prices.length - 1][0], // Math.floor(new Date().getTime() / 1000),
        indicatorValues : []  // faltarà posar valors als indicadors
    }

    // Per cada indicador, l'apliquem a les dades i ens quedem amb l'últim valor
    for (let i = 0; i < market.indicator.length; i++) {
        // Apliquem l'indicador sobre el preu al tancament (índex 4)
        let indicator = await this.applyIndicator(prices, market.indicator[i].name, market.indicator[i].period, DATA_TIMESTAMP_INDEX, DATA_PRICE_INDEX);

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
    if (lastData && lastData.indicatorValues && Array.isArray(lastData.indicatorValues) && lastData.indicatorValues.length > 0) {
        try {
            action = decisionMaker.decide(market, lastData, currentData);
        } catch(exDecisor) {
            return {
                "error" : [ exDecisor.message ],
                "result" : { }
            }    
        }
    } else {
        console.log("brokerControl.checkAndDecide : lastData with incorrect format, can not calculate stratey for the current value");
    }

    currentData.decision = action;
    if (prices && Array.isArray(prices) && prices.length > 0) {
        currentData.price = prices[prices.length -1][4];
    }

    return {
        "error" : [ ],
        "result" : {
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

/**
 * Funció que a partir d'un llistat de preus i una configuració
 * de mercat analitza l'estratègia especificada en el mercat sobre
 * dels preus i retorna el benefici que s'obtindria.
 * Es guarda a la BD la seqüència de decisions preses per poder
 * mostrar-ho gràficament
 * @param {*} analysisBatchNumber : número que identificarà el conjunt 
 *                   d'anàlisis realitzats del que aquest formarà part
 * @param {*} analysisId : identificador de l'anlàsisi dins del conjunt 
 *                   d'anàlisis que es realitzaran
 * @param {*} funds : quantitat de € que es fa servir per la compra inicial
 * @param {*} comission : [ 1%, 2% ] quantitat que es queda l'exchange per cada compra o venda
 * @param {*} market : {} objecte amb la definició del mercat, tal i com apareix al config
 * @param {*} prices : [] matriu amb els preus
 * Retorna un array de resultats del tipus:
 * {
 *   "error" : [],
 *   "result" : {
 *      data: [{
 *          market : "id",
 *          windowStart : 1614933060,
 *          windowEnd : 1614945000,
 *          price : 34,
 *          indicatorValues : [
 *              { "name" : "DEMA", "period" : 20, "value" : 34 },
 *              { "name" : "DEMA", "period" : 50, "value" : 34 }
 *          ],
 *          decision : "buy" / "sell" / "relax",
 *          volume : , // Valor NOU, guarda el volum comprat (€ compra / preu moment de la compra)
 *          buyPrice :   // Valor NOU, guarda l'últim preu de compra, per poder calcular el benefici
 *      }, ... ],
 *      fundsBegin : 100,        // € a l'inici del domini
 *      fundsEnd : 110,       // € al final de l'anàlisi
 *      comission : 5,      // comissió total, es sumen les comissions aplicades a cada operació
 *      profit : 5,         // benefici total, es sumen els beneficis de cada operació
 *      analysisBatchNumber: "", // identificador del procés d'anàlisis
 *      analysisId: 1       // id de l'anàlisi
 *   }
 * }
 */
exports.analizeStrategy = async function(analysisBatchNumber, analysisId, funds, comission, market, prices, decisionMaker) {
    try {
        // Busquem el període mes gran dels indicadors, aquest ens dirà a partir de quin
        // punt hem de començar a analitzar els prices (els DEMA necessiten X dades previes)
        // P.e.: Si tenim un array de 50 prices i els indicadors que fem servir són DEMA 10 i DEMA 20
        // començarem a calcular al array número 20 de prices i l'aplicarem fins arrivar al final,
        // per tant farem 30 execucions de la funció checkAndDecide, cada cop amb un valor mes al
        // array de prices
        let maxPeriod = 0;
        for (let i = 0; i < market.indicator.length; i++) {
            switch(market.indicator[i].name) {
                case "MACD":
                    if (market.indicator[i].period.longInterval > maxPeriod) {
                        maxPeriod = market.indicator[i].period.longInterval;
                    }
                    break;
                default:
                    if (market.indicator[i].period > maxPeriod) {
                        maxPeriod = market.indicator[i].period;
                    }
                    break;
            }
        }

        if (prices.length <= maxPeriod) {
            return {
                "error" : [ "Error, the prices length must be greater than the max period"],
                "result" : null
            }
        }

        let result = {
            "data" : new Array(prices.length - maxPeriod),
            "fundsBegin" : funds,
            "fundsEnd" : 0,
            "comission" : 0,
            "profit" : 0,
            "analysisBatchNumber" : analysisBatchNumber,
            "analysisId" : analysisId
        };

        // Inicialitzem el valor de lastData
        let lastData = { };
        let lastDecision = "";

        // Executem el checkAndDecide per cada price i guardem les dades resultants
        // per analitzarles posteriorment
        for (let i = maxPeriod; i < prices.length; i++) {

            //console.log("Step " + i + " of " + prices.length);
            
            let partialPrices = prices.slice(0, i+1); // Nota: La posició final (contant des de zero) en la qual finalitzarà l'extracció. slice extraurà fins a aquesta posicó, sense incloure-la.

            // Executem la funció amb les dades recuperades que ha de decidir que fer, si comprar, vendre o res
            // Retorna una cosa del tipus: {
            //   "error" : [],
            //   "result" : {
            //     "currentData" : {
            //       ...
            //       "decision" : "buy" / "sell" / "relax"
            //   }
            // }
            //let decision = brokerControl[fn](market, lastData);
            let decision = await this.checkAndDecide(market, lastData, partialPrices, decisionMaker);
            if (decision.error.length > 0) {
                console.error("Error in checkAndDecide " + decision.error[0]);
                return decision;
            }

            //console.log(decision);

            // Si l'última decisió és igual que l'actual, la marquem com a relax, per no comprar o vendre dos cops consecutius
            if (decision.result.currentData.decision === "buy" || decision.result.currentData.decision === "sell") {
                if (decision.result.currentData.decision === lastDecision) {
                    // Si l'última decisió és igual que l'actual la posem com "relax"
                    decision.result.currentData.decision = "relax";
                } else {
                    lastDecision = decision.result.currentData.decision;
                }
            }

            // Calculem beneficis
            switch (decision.result.currentData.decision) {
                case "relax":
                    // El volum es manté constant
                    decision.result.currentData.volume = (lastData.volume ? lastData.volume : 0);
                    // Passem el preu de l'última compra
                    decision.result.currentData.buyPrice = (lastData.buyPrice ? lastData.buyPrice : 0);
                    break;
                case "buy":
                    // Valor NOU, calculem el preu, sense la comissió de compra
                    // El primer cop que comprem tindrem els € per comprar cripto a funds
                    // A partir de la primera venda els € resultants els tindrem a result
                    let buyPrice = (result.fundsEnd === 0 ? result.fundsBegin : result.fundsEnd);
                    let buyComission = (buyPrice * comission[0] / 100);
                    let buyPriceWithOutCommission = buyPrice - buyComission;
                    // Sumem la comissió actual a les totals
                    result.comission += buyComission;
                    // Valor NOU, calculem el volum comprat
                    decision.result.currentData.volume = buyPriceWithOutCommission / decision.result.currentData.price;
                    decision.result.currentData.buyPrice = buyPriceWithOutCommission;

                    // El posem a 0 ja que hem comprat crypto i ja no tenim €
                    result.fundsEnd = 0;
                    break;
                case "sell":
                    // Si volume és 0 es que no hi ha res per vendre => no fem la venda
                    if (lastData.volume != 0) {
                        // Apliquem comissió de venda i calculem el resultat i el posem a funds
                        let sellPrice = (lastData.volume ? lastData.volume : 0) * decision.result.currentData.price;
                        let sellComission = (sellPrice * comission[1] / 100);
                        // Treiem la comissió
                        result.fundsEnd = sellPrice - sellComission;
                        // Sumem la comissió actual a les totals
                        result.comission += sellComission;
                        // Sumem el benefici al total
                        //result.profit += (result.fundsEnd - (lastData.buyPrice ? lastData.buyPrice : 0));
                        result.profit += (result.fundsEnd - result.fundsBegin);

                        // Ja no temim currency per tant el volum és 0 i el preu de l'última compra també
                        decision.result.currentData.volume = 0;
                        decision.result.currentData.buyPrice = 0;

                        //console.log(result);
                    } else {
                        // El volum es manté constant
                        decision.result.currentData.volume = (lastData.volume ? lastData.volume : 0);
                        // Passem el preu de l'última compra
                        decision.result.currentData.buyPrice = (lastData.buyPrice ? lastData.buyPrice : 0);
                        // Marquem que no es ven
                        decision.result.currentData.decision = "relax";
                    }
                    break;
            }

            // Emmagatzemem les dades obtingudes
            //result.data.push(decision.result.currentData);
            result.data[i - maxPeriod] = decision.result.currentData;

            // Guardem l'últim valor calculat per la següent iteració
            lastData = decision.result.currentData;
        }

        return {
            "error" : [ ],
            "result" : result
        }
    } catch (e) {
        return {
            "error" : [ "Exception analizing strategy " + e.message ],
            "result" : e
        }
    }
}
