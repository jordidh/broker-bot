"use strict";

/**
 * Module dependencies
 */
const logger = require('../api/logger');
const moment = require('moment');
const { v1: uuidv1 } = require('uuid');
const fs = require('fs').promises;
const kraken = require('../api/exchanges/kraken/apis');
const krakenMoked = require('../api/exchanges/kraken/apisMocked');
const config = require('../config/config');
const pjson = require('../package.json');
const https = require('https');
var express = require('express');
const router = express.Router();
var BotPersistentData = require('../api/database/botPersistentData');
const brokerControl = require('../api/brokerControl');

const decisionMakerDemax2 = require('../api/decisionMakers/demax2');
const decisionMakerEmax2AdxMacd = require('../api/decisionMakers/emax2-adx-macd');
const decisionMakerBBands = require('../api/decisionMakers/bbands');
const decisionMakerMacd = require('../api/decisionMakers/macd');
const { ExceptionHandler } = require('winston');

const colors = ['#2f7ed8', '#0d233a', '#8bbc21', '#910000', '#1aadce',
'#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'];

const TEST_DATA_PATH = "./database/prices";

const EXCHANGES = [
    { name : "Kraken", url : "https://api.kraken.com/0/public/OHLC" }
];
const KRAKEN_PAIRS_FIAT_CRYPTO = [
    "AAVEUSD", "AAVEEUR", "ALGOUSD", "ALGOEUR", "ANTUSD", "ANTEUR",
    "XBTUSD", "XBTEUR",
    "ADAUSD", "ADAEUR",
    "ETHUSD", "ETHEUR",
    "LTCUSD", "LTCEUR",
    "XRPUSD", "XRPEUR",
    "USDTUSD", "USDTEUR"
];
const KRAKEN_INTERVALS = [
    1, 5, 15, 30, 60, 240, 1440, 10080, 21600
];

router.get('/', function (req, res, next) {
    let reqId = uuidv1();

    // Enviem missatge al telegram de l'usuari per indicar que hem rebut un post
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    logger.info(reqId + `: Rebut GET des de ` + ip + ` : ` + fullUrl);

    try {
        res.render('index', { name: pjson.name, version: pjson.version, baseUrl : config.APP_CLIENT_BASE_URL });
    } catch (e) {
        logger.error(e);
        res.render('index', { name: pjson.name, version: pjson.version, baseUrl : config.APP_CLIENT_BASE_URL, m_alert: e.message });
    }
});

router.get('/dashboard', function (req, res, next) {
    let reqId = uuidv1();

    // Enviem missatge al telegram de l'usuari per indicar que hem rebut un post
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    logger.info(reqId + `: Rebut GET des de ` + ip + ` : ` + fullUrl);

    try {
        res.render('dashboard', { name: pjson.name, version: pjson.version, baseUrl : config.APP_CLIENT_BASE_URL, views: config.dashboard.views });
    } catch (e) {
        logger.error(e);
        res.render('dashboard', { name: pjson.name, version: pjson.version, baseUrl : config.APP_CLIENT_BASE_URL, m_alert: e.message });
    }
});


router.get('/markets', async function (req, res, next) {
    let reqId = uuidv1();

    // Enviem missatge al telegram de l'usuari per indicar que hem rebut un post
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    logger.info(reqId + `: Rebut GET des de ` + ip + ` : ` + fullUrl);

    try {
        // Recuperem tots els fitxers JSON amb dades de prova per mostrar-los i que es pugui analitzar
        let testPrices = await fs.readdir(TEST_DATA_PATH);

        res.render('markets', { name: pjson.name, version: pjson.version, baseUrl : config.APP_CLIENT_BASE_URL, config : config.jobs.checkMarkets, testPrices : testPrices });
    } catch (e) {
        logger.error(e);
        res.render('markets', { name: pjson.name, version: pjson.version, baseUrl : config.APP_CLIENT_BASE_URL, m_alert: e.message });
    }
});

/**
 * Funció per mostrar una gràfica amb els últims anàlisis i decisions
 * /anaysis?market=id&numberOfValues=50 : recupera els prices guardats a la BD pel JOB i els analitza
 * /anaysis?market=id&numberOfValues=50&testData=file.json : recupera els prices guardats en fitxers i els analitza
 */
router.get('/analysis', async function (req, res, next) {
    let reqId = uuidv1();

    // Enviem missatge al telegram de l'usuari per indicar que hem rebut un post
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    logger.info(reqId + `: Rebut GET des de ` + ip + ` : ` + fullUrl);

    let dataToShow = {
        "title" : "Analysis",
        "subtitle": "Click and drag in the chart to zoom in and inspect the data on Y axis.",
        "yAxisTitle" : "Price",
        "yAxisDesc" : "Price",
        "xAxisTitle" : "Timestamp",
        "xAxisDesc" : "Date times in ISO format",
        "xAxisCategories" : "[]",  /// array amb els timestamps
        "tooltipValueSuffix" : "€",
        "series" : {}
    }

    try {
        // Recuperem o creem una instància per accedir a les dades
        let botData = new BotPersistentData().getInstance();

        // Recuperem el id número de valors que es volen recuperar
        // Default number of values
        let numberOfValues = 50;
        if (req.query.numberOfValues) {
            numberOfValues = req.query.numberOfValues;
        }

        // Recuperem el id del mercat que volem consultar
        let marketId = "";
        if (req.query.market) {
            marketId = req.query.market;
        } else {
            // Si no s'indica el mercat agafem el primer
            let markets = await botData.getMarkets();

            if (markets.error.length > 0) {
                logger.error("No data found calling botData.getMarkets: " + markets.error[0]);
                return res.render('analysis', { 
                    name: pjson.name, 
                    version: pjson.version, 
                    baseUrl : config.APP_CLIENT_BASE_URL,
                    data : dataToShow,
                    m_alert: "No data found calling botData.getMarkets: " + markets.error[0] 
                });
            } else {
                if (markets.result.length > 0) {
                    marketId = markets.result[0].market;
                }
            }
        }

        // Recuperem el market de la configuració
        let market = config.jobs.checkMarkets.markets.find(m => m.id === marketId);
        if (typeof market === "undefined") {
            logger.error("No market found with id = " + marketId);
        }

        // Ja tenim les dades per posar títol a la gràfica
        dataToShow.title = marketId + " - Analysis of last prices and indexes";

        // Reuperem les dades que volem mostrar
        let lastData = [];
        if (req.query.testData) {
            // recuperem les dades de test
            const rawPrices = await fs.readFile(TEST_DATA_PATH + "/" + req.query.testData, "ascii");
            const prices = JSON.parse(rawPrices); // Array d'arrays on cada element ha de ser un array del tipus [ unixtime, obertura, màxim, mínim, tancament ]

            // Apliquem l'estratègia a sobre dels preus
            let funds = 1000;
            let comission = [2, 2];

            // triem el decision maker
            let decisionMaker = null;
            switch(market.strategy) {
                case "demax2":
                    decisionMaker = decisionMakerDemax2;
                    break;
                case "emax2-adx-macd":
                    decisionMaker = decisionMakerEmax2AdxMacd;
                    break;
                case "bbands":
                    decisionMaker = decisionMakerBBands;
                    break;
                case "macd":
                    decisionMaker = decisionMakerMacd;
                    break;
                default:
                    console.error("Market strategy is not valid \"" + market.strategy + "\"");
                    break;
            }

            lastData = await brokerControl.analizeStrategy("B1", 1, funds, comission, market, prices, decisionMaker);

            if (lastData.error.length > 0) {
                throw new Error(lastData.error[0]);
            }

        } else {
            // Si no s'indica agafar les dades de prices de test s'agafen de la BD

            // Recuperem últimes dades emmagatzemades per aquest mercat
            // Retorna una cosa del tipus: [{
            //   market : "id",
            //   windowStart : 1614933060,
            //   windowEnd : 1614945000,
            //   price : 34,
            //   indicatorValues : [
            //     { "name" : "DEMA", "period" : 20, "value" : 34 },
            //     { "name" : "DEMA", "period" : 50, "value" : 34 }
            //   ],
            //   decision : "relax"
            // }]
            lastData = {
                "error" : [],
                "result" : {
                    "data" : [],
                    "fundsBegin" : 0,
                    "fundsEnd" : 0,
                    "comission" : 0,
                    "profit" : 0,
                    "analysisBatchNumber" : "",
                    "analysisId" : 0
                }
            }
            let res = await botData.getLastMarketDatasAsc(marketId, numberOfValues);
            lastData.result.data = res.result;
            lastData.error = res.error;
            if (lastData.error.length > 0) {
                logger.error("No data found calling getLastMarketDatasAsc: " + lastData.error[0]);
                return res.render('analysis', { 
                    name: pjson.name, 
                    version: pjson.version, 
                    baseUrl : config.APP_CLIENT_BASE_URL,
                    data : dataToShow,
                    m_alert: "No data found calling getLastMarketDatasAsc: " + lastData.error[0] 
                });
            }
        }

        //console.log(lastData);

        // Convertim les dades obtingudes en un array que es pugui mostrar fàcilment en una gràfica
        // P.e. { market : "id", indicator : [
        //    { name : "", period : "", values: [ timestamp, value ] },
        //    { name : "", period : "", values: [ timestamp, value ] }
        // ]}
        

        // Calculem timestamps i series de dades per mostrar-les gràficament
        let timestamps = [];
        let timestampsUnixEpoch = [];
        let series = [];
        let color = 0;

        // Passada 1: posem els timestamps i creem les sèries
        for (let i = 0; i < lastData.result.data.length; i++) {
            let currentTime = (new Date(lastData.result.data[i].windowEnd * 1000)).toISOString();
            let timeFound = timestamps.find(o => o === currentTime);
            if (typeof timeFound === "undefined") {
                timestamps.push(currentTime);
                timestampsUnixEpoch.push(lastData.result.data[i].windowEnd);
            }
           
            for (let j = 0; j < lastData.result.data[i].indicatorValues.length; j++) {

                if (lastData.result.data[i].indicatorValues[j].name === "BBANDS") {
                    let serieName = lastData.result.data[i].indicatorValues[j].name + lastData.result.data[i].indicatorValues[j].period;
                    let serieFound = series.find(o => o.name.startsWith(serieName));
                    if (typeof serieFound === "undefined") {
                        series.push({
                            "name" : serieName + "-middle",
                            "data" : [ ],
                            "color" : colors[color],
                            "website" : "",
                            "description" : "middle"
                        });
                        color++;

                        series.push({
                            "name" : serieName + "-lower",
                            "data" : [ ],
                            "color" : colors[color],
                            "website" : "",
                            "description" : "lower"
                        });
                        color++;

                        series.push({
                            "name" : serieName + "-upper",
                            "data" : [ ],
                            "color" : colors[color],
                            "website" : "",
                            "description" : "upper"
                        });
                        color++;
                    }
                } else if (lastData.result.data[i].indicatorValues[j].name === "MACD") {
                    let serieName = lastData.result.data[i].indicatorValues[j].name;
                    let serieFound = series.find(o => o.name.startsWith(serieName));
                    if (typeof serieFound === "undefined") {
                        series.push({
                            "name" : serieName + "-hist.",
                            "data" : [ ],
                            "color" : colors[color],
                            "website" : "",
                            "description" : "histogram"
                        });
                        color++;

                        series.push({
                            "name" : serieName + "-macd",
                            "data" : [ ],
                            "color" : colors[color],
                            "website" : "",
                            "description" : "macd"
                        });
                        color++;

                        series.push({
                            "name" : serieName + "-signal",
                            "data" : [ ],
                            "color" : colors[color],
                            "website" : "",
                            "description" : "signal"
                        });
                        color++;
                    }
                } else {
                    let serieName = lastData.result.data[i].indicatorValues[j].name + lastData.result.data[i].indicatorValues[j].period;
                    let serieFound = series.find(o => o.name === serieName);
                    if (typeof serieFound === "undefined") {
                        series.push({
                            "name" : serieName,
                            "data" : [ ],
                            "color" : colors[color],
                            "website" : "",
                            "description" : serieName
                        });
                        color++;
                    }
                }
            }
        }

        // Afegim una altra serie pel preu
        series.push({
            "name" : marketId,
            "data" : [ ],
            "color" : colors[color],
            "website" : "",
            "description" : marketId
        });

        // Creem els arrays de les series inicialitzades a 0
        for (let i = 0; i < series.length; i++) {
            series[i].data = Array(timestamps.length).fill(0);
        }

        // Passada 2: per a cada timestamp posem el valor a les sèries i calculem el benefici
        dataToShow.totalProfit = lastData.result.profit; // benefici total, es sumen els beneficis de cada operació
        dataToShow.initialFunds = lastData.result.fundsBegin;        // € a l'inici del domini
        dataToShow.endFunds = lastData.result.fundsEnd;       // € al final de l'anàlisi
        dataToShow.totalComission =  lastData.result.comission;      // comissió total, es sumen les comissions aplicades a cada operació

        for (let i = 0; i < timestamps.length; i++) {
            // Busquem les dades que corresponguin a aquest timestamp
            let dataFound = lastData.result.data.filter(o => o.windowEnd === timestampsUnixEpoch[i]);

            if (dataFound) {
                // De les dades recuperades mirem a quina sèrie corresponen (comparema amb el nom i period)
                for (let s = 0; s < series.length; s++) {
                    // De les dades trobades ens quedem amb el primer indicador que pertanyi a la serie
                    for (let j = 0; j < dataFound.length; j++) {
                        if (series[s].name.startsWith("BBANDS")) {
                            let indicatorFound = dataFound[j].indicatorValues.find(o => series[s].name.startsWith(o.name + o.period));
                            if (indicatorFound) {
                                switch(series[s].description) {
                                    case "middle":
                                        series[s].data[i] = indicatorFound.value.middle;
                                        break;
                                    case "lower":
                                        series[s].data[i] = indicatorFound.value.lower;
                                        break;
                                    case "upper":
                                        series[s].data[i] = indicatorFound.value.upper;
                                        break;
                                }
                            }
                        } else if (series[s].name.startsWith("MACD")) {
                            let indicatorFound = dataFound[j].indicatorValues.find(o => series[s].name.startsWith(o.name));
                            if (indicatorFound) {
                                switch(series[s].description) {
                                    case "histogram":
                                        series[s].data[i] = indicatorFound.value.histogram;
                                        break;
                                    case "macd":
                                        series[s].data[i] = indicatorFound.value.macd;
                                        break;
                                    case "signal":
                                        series[s].data[i] = indicatorFound.value.signal;
                                        break;
                                }
                            }
                        } else {
                            let indicatorFound = dataFound[j].indicatorValues.find(o => (o.name + o.period) === series[s].name);
                            if (indicatorFound) {
                                series[s].data[i] = indicatorFound.value;
                            }
                        }
                    }
                }

                // Posem el valor a la sèrie del preu, sempre serà l'últim
                // Si venem o comprem posem un indicdor especial
                switch(dataFound[0].decision) {
                    case "sell":
                        series[series.length - 1].data[i] = {
                            y : dataFound[0].price,
                            marker : { 
                                //symbol : "url(http://localhost:4300/images/chart-decreasing.png)"
                                symbol : "url(images/chart-decreasing.png)"
                            }
                        }
                        break;
                    case "buy":
                        series[series.length - 1].data[i] = {
                            y : dataFound[0].price,
                            marker : { 
                                //symbol : "url(http://localhost:4300/images/chart-increasing.png)"
                                symbol : "url(images/chart-increasing.png)"
                            }
                        }
                        break;
                    default:
                        series[series.length - 1].data[i] = dataFound[0].price;
                        break;
                }
            }
        }

        // Guardem els valors a l'objecte i el passem al template
        dataToShow.xAxisCategories = JSON.stringify(timestamps);
        dataToShow.series = JSON.stringify(series);

        res.render('analysis', { 
            name: pjson.name, 
            version: pjson.version,
            baseUrl : config.APP_CLIENT_BASE_URL,
            data : dataToShow
        });
    } catch (e) {
        logger.error(e);
        res.render('analysis', { name: pjson.name, version: pjson.version, baseUrl : config.APP_CLIENT_BASE_URL, m_alert: e.message, data : dataToShow });
    }
});

/**
 * Funció que recupera OHLC preus de Kraken i permet guardar-los com a dades de test
 * 
 * The REST API OHLC endpoint only provides a limited amount of historical data, specifically 720 data points of the requested interval. 
 * For example, asking for OHLC data in 1 minute intervals will return the most recent 720 minutes (12 hours) of data.
 * 
 * Get OHLC data
 * URL: https://api.kraken.com/0/public/OHLC
 * Input:
 *   pair = asset pair to get OHLC data for
 *   interval = time frame interval in minutes (optional):
 *   1 (default), 5, 15, 30, 60, 240, 1440, 10080, 21600
 *   since = return committed OHLC data since given id (optional.  exclusive)
 * Result: array of pair name and OHLC data
 *   <pair_name> = pair name
 *      array of array entries(<time>, <open>, <high>, <low>, <close>, <vwap>, <volume>, <count>)
 *   last = id to be used as since when polling for new, committed OHLC data
 * Note: the last entry in the OHLC array is for the current, not-yet-committed frame and will always be present, regardless of the value of "since".
 * 
 * 
 * For applications that require additional OHLC or tick data, it is possible to retrieve the entire trading history of our markets (the 
 * historical time and sales) via the REST API Trades endpoint. The OHLC for any time frame and any interval can then be created from the
 * historical time and sales data.
 * 
 * For example, a call to the Trades endpoint such as https://api.kraken.com/0/public/Trades?pair=xbtusd&since=1559347200000000000 would 
 * return the historical time and sales for XBT/USD from the 1st of June 2019 at 00:00:00 UTC:
 * {"error":[],"result":{"XXBTZUSD":[["8552.90000","0.03190270",1559347203.7998,"s","m",""],["8552.90000","0.03155529",1559347203.8086,"s","m",""],["8552.90000","0.00510797",1559347203.9664,"s","m",""],["8552.90000","0.09047336",1559347203.9789,"s","m",""],["8552.90000","0.00328738",1559347203.9847,"s","m",""],["8552.90000","0.00492152",1559347203.9897,"s","m",""],["8552.90000","0.00201848",1559347203.9937,"s","m",""],["8552.90000","0.11422068",1559347203.9993,"s","m",""],["8552.90000","0.00425858",1559347204.071,"s","m",""],["8552.90000","0.00427679",1559347204.0762,"s","m",""],["8552.90000","0.06381401",1559347204.1662,"s","m",""]
 * ...
 * ["8579.50000","0.05379597",1559350785.248,"s","l",""],["8579.50000","0.94620403",1559350785.2936,"s","l",""],["8578.10000","0.45529068",1559350785.297,"s","l",""]],"last":"1559350785297011117"}}
 * 
 * Subsequent calls to the Trades endpoint should replace the since parameter's value with the last parameter's value from the results of the previous call such as https://api.kraken.com/0/public/Trades?pair=xbtusd&since=1559350785297011117.
 * 
 * Using the special since value of 0 (zero) would return the historical time and sales from the beginning of the market (starting with the very first trade). 
 * 
 * Get recent trades
 * URL: https://api.kraken.com/0/public/Trades
 * Input:
 *   pair = asset pair to get trade data for
 *   since = return trade data since given id (optional.  exclusive)
 * Result: array of pair name and recent trade data
 *   <pair_name> = pair name
 *      array of array entries(<price>, <volume>, <time>, <buy/sell>, <market/limit>, <miscellaneous>)
 *   last = id to be used as since when polling for new trade data
 */
router.get('/prices', function (req, res, next) {
    let reqId = uuidv1();

    // Enviem missatge al telegram de l'usuari per indicar que hem rebut un post
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    logger.info(reqId + `: Rebut GET des de ` + ip + ` : ` + fullUrl);

    let dataToShow = {
        "title" : "Pair " + req.query.pair + " interval " + req.query.interval,
        "subtitle": "Get from " + req.query.exchange,
        "yAxisTitle" : req.query.pair,
        "yAxisDesc" : "Price " + req.query.pair,
        "xAxisTitle" : "Timestamp",
        "xAxisDesc" : "Date times in ISO format",
        "xAxisCategories" : "[]",  /// array amb els timestamps
        "tooltipValueSuffix" : "€",
        "series" : "",
        "startDate" : "",
        "startTime" : "",
        "endDate" : "",
        "endTime" : ""
    }

    try {
        // Si està definit les req.query per fer una crida a kraken ho fem i passem les dades al template per mostrar-les
        if (req.query.exchange && req.query.pair && req.query.interval) {
            // 'https://api.kraken.com/0/public/OHLC?pair=BTCEUR&interval=5'
            let url = req.query.exchange + "?pair=" + req.query.pair + "&interval=" + req.query.interval;
            https.get(url, (resp) => {
                let data = [];

                // A chunk of data has been received.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    //console.log(data);

                    // Retornem de la funció principal
                    let jsonReceived = JSON.parse(data);

                    // Convertim el json obtingut de kraken a un json que es pugui mostrar a la gràfica highcharts
                    // Com que no sabem el nom del pair obtingut accedim a la primera propietat de l'objecte
                    // let dataWithChartFormat = jsonReceived.result.XXBTZEUR.map(function(element) {
                    let dataWithChartFormat = jsonReceived.result[Object.keys(jsonReceived.result)[0]].map(function(element) {
                        return [
                            element[0] * 1000,  // multipliquem el time unixepoch per 1000 ja que highcharts ho necessita em ms i kraken ho envia per segos
                            parseFloat(element[1]),
                            parseFloat(element[2]),
                            parseFloat(element[3]),
                            parseFloat(element[4])
                        ];
                    });

                    //console.log(dataWithChartFormat);

                    dataToShow.series = JSON.stringify(dataWithChartFormat);
                    //dataToShow.series = dataWithChartFormat;
                    
                    if (dataWithChartFormat.length > 0){
                        let startDate = new Date(dataWithChartFormat[0][0]);
                        let endDate = new Date(dataWithChartFormat[dataWithChartFormat.length - 1][0]);

                        dataToShow.startDate = startDate.toISOString().substring(0, 10);   //2011-10-05T14:48:00.000Z
                        dataToShow.startTime = startDate.toISOString().substring(11, 19);
                        dataToShow.endDate = endDate.toISOString().substring(0, 10);
                        dataToShow.endTime = endDate.toISOString().substring(11, 19);
                    }

                    res.render('prices', { name: pjson.name, version: pjson.version, baseUrl : config.APP_CLIENT_BASE_URL, 
                        exchanges : EXCHANGES, pairs : KRAKEN_PAIRS_FIAT_CRYPTO, intervals : KRAKEN_INTERVALS, data : dataToShow 
                    });
                });
            }).on('error', (err) => {
                logger.error("Error in GET to krakenapi ", err);
                res.render('prices', { name: pjson.name, version: pjson.version, baseUrl : config.APP_CLIENT_BASE_URL, 
                    exchanges : EXCHANGES, pairs : KRAKEN_PAIRS_FIAT_CRYPTO, intervals : KRAKEN_INTERVALS, data : dataToShow,
                    m_alert: err.message
                });
            });
        } else {
            res.render('prices', { name: pjson.name, version: pjson.version, baseUrl : config.APP_CLIENT_BASE_URL, 
                exchanges : EXCHANGES, pairs : KRAKEN_PAIRS_FIAT_CRYPTO, intervals : KRAKEN_INTERVALS, data : dataToShow 
            });
        }
    } catch (e) {
        logger.error(e);
        res.render('prices', { name: pjson.name, version: pjson.version, baseUrl : config.APP_CLIENT_BASE_URL, m_alert: e.message,
            data : dataToShow
        });
    }
});

router.post('/prices', async function (req, res, next) {
    let reqId = uuidv1();

    // Enviem missatge al telegram de l'usuari per indicar que hem rebut un post
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    logger.info(reqId + `: Rebut GET des de ` + ip + ` : ` + fullUrl);
    
    let dataToShow = {
        "title" : "Pair " + req.query.pair + " interval " + req.query.interval,
        "subtitle": "Get from " + req.query.exchange,
        "yAxisTitle" : req.query.pair,
        "yAxisDesc" : "Price " + req.query.pair,
        "xAxisTitle" : "Timestamp",
        "xAxisDesc" : "Date times in ISO format",
        "xAxisCategories" : "[]",  /// array amb els timestamps
        "tooltipValueSuffix" : "€",
        "series" : req.body.series,
        "startDate" : req.body.startDate,
        "startTime" : req.body.startTime,
        "endDate" : req.body.endDate,
        "endTime" : req.body.endTime
    }

    try {
        // Guardem les dades, entre el rang definit en un fitxer per poder testejar diferents estrategies

        // Convert to 2011-10-05T14:48:00.000Z
        let startDate = new Date(req.body.startDate + "T" + req.body.startTime + ":00.000Z");
        let startDateEpoch = startDate.getTime();
        let endDate = new Date(req.body.endDate + "T" + req.body.endTime + ":00.000Z");
        let endDateEpoch = endDate.getTime();

        let series = JSON.parse(req.body.series);
        let seriesToSave = [];
        let numDataSaved = 0;
        for (let i = 0; i < series.length; i++) {
            if (series[i][0] >= startDateEpoch && series[i][0] <= endDateEpoch) {
                seriesToSave.push(series[i]);
                numDataSaved++;
            }
        }
        let seriesToSaveString = JSON.stringify(series);

        let filename = req.body.filename;
        if (!filename.endsWith(".json")) {
            filename += ".json";
        }

        const rawPrices = await fs.writeFile(TEST_DATA_PATH + "/" + filename, seriesToSaveString, "ascii");

        res.render('prices', { name: pjson.name, version: pjson.version, baseUrl : config.APP_CLIENT_BASE_URL, 
            m_success: "Data saved to test file successfully. Points saved = " + numDataSaved, data : dataToShow
        });
    } catch (e) {
        logger.error(e);
        res.render('prices', { name: pjson.name, version: pjson.version, baseUrl : config.APP_CLIENT_BASE_URL, m_alert: e.message,
            data : dataToShow
        });
    }
});

module.exports = router;

