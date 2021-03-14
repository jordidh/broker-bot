"use strict";

/**
 * Module dependencies
 */
const logger = require('../api/logger');
const moment = require('moment');
const { v1: uuidv1 } = require('uuid');
const kraken = require('../api/exchanges/kraken/apis');
const krakenMoked = require('../api/exchanges/kraken/apisMocked');
const config = require('../config/config');
const pjson = require('../package.json');
var express = require('express');
const router = express.Router();
var BotPersistentData = require('../api/database/botPersistentData');

const colors = ['#2f7ed8', '#0d233a', '#8bbc21', '#910000', '#1aadce',
'#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'];

router.get('/', function (req, res, next) {
    let reqId = uuidv1();

    // Enviem missatge al telegram de l'usuari per indicar que hem rebut un post
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    logger.info(reqId + `: Rebut GET des de ` + ip);

    try {
        res.render('index', { name: pjson.name, version: pjson.version});
    } catch (e) {
        logger.error(e);
        res.render('index', { name: pjson.name, version: pjson.version, m_alert: e.message });
    }
});

router.get('/dashboard', function (req, res, next) {
    let reqId = uuidv1();

    // Enviem missatge al telegram de l'usuari per indicar que hem rebut un post
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    logger.info(reqId + `: Rebut GET des de ` + ip);

    try {
        res.render('dashboard', { name: pjson.name, version: pjson.version, views: config.dashboard.views });
    } catch (e) {
        logger.error(e);
        res.render('dashboard', { name: pjson.name, version: pjson.version, m_alert: e.message });
    }
});


router.get('/markets', function (req, res, next) {
    let reqId = uuidv1();

    // Enviem missatge al telegram de l'usuari per indicar que hem rebut un post
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    logger.info(reqId + `: Rebut GET des de ` + ip);

    try {
        res.render('markets', { name: pjson.name, version: pjson.version, markets : config.jobs.checkMarkets.markets });
    } catch (e) {
        logger.error(e);
        res.render('markets', { name: pjson.name, version: pjson.version, m_alert: e.message });
    }
});

/**
 * Funció per mostrar una gràfica amb elsúltims anàlisis i decisions
 * /anaysis?market=id&numberOfValues=50
 */
router.get('/analysis', async function (req, res, next) {
    let reqId = uuidv1();

    // Enviem missatge al telegram de l'usuari per indicar que hem rebut un post
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    logger.info(reqId + `: Rebut GET des de ` + ip);

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
        if (req.query.marquet) {
            marketId = req.query.marquet;
        } else {
            // Si no s'indica el mercat agafem el primer
            let markets = await botData.getMarkets();

            if (markets.error.length > 0) {
                logger.error("No data found calling botData.getMarkets: " + markets.error[0]);
                return res.render('analysis', { 
                    name: pjson.name, 
                    version: pjson.version, 
                    data : dataToShow,
                    m_alert: "No data found calling botData.getMarkets: " + markets.error[0] 
                });
            } else {
                if (markets.result.length > 0) {
                    marketId = markets.result[0].market;
                }
            }
        }

        // Ja tenim les dades per posar títol a la gràfica
        dataToShow.title = marketId + " - Analysis of last " + numberOfValues + " prices and indexes";

        // Recuperem últimes dades emmagatzemades per aquest mercat
        // Retorna una cosa del tipus: [{
        //   market : "id",
        //   windowStart : 1614933060,
        //   windowEnd : 1614945000,
        //   indicatorValues : [
        //     { "name" : "DEMA", "period" : 20, "value" : 34 },
        //     { "name" : "DEMA", "period" : 50, "value" : 34 }
        //   ]
        // }]
        let lastData = await botData.getLastMarketDatasAsc(marketId, numberOfValues);
        if (lastData.error.length > 0) {
            logger.error("No data found calling getLastMarketDatasAsc: " + lastData.error[0]);
            return res.render('analysis', { 
                name: pjson.name, 
                version: pjson.version, 
                data : dataToShow,
                m_alert: "No data found calling getLastMarketDatasAsc: " + lastData.error[0] 
            });
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
        for (let i = 0; i < lastData.result.length; i++) {
            let currentTime = (new Date(lastData.result[i].windowEnd * 1000)).toISOString();
            let timeFound = timestamps.find(o => o === currentTime);
            if (typeof timeFound === "undefined") {
                timestamps.push(currentTime);
                timestampsUnixEpoch.push(lastData.result[i].windowEnd);
            }
           
            for (let j = 0; j < lastData.result[i].indicatorValues.length; j++) {
                let serieName = lastData.result[i].indicatorValues[j].name + lastData.result[i].indicatorValues[j].period;
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

        // Creem els arrays de les series inicialitzades a 0
        for (let i = 0; i < series.length; i++) {
            series[i].data = Array(timestamps.length).fill(0);
        }

        // Passada 2: per a cada timestamp posem el valor a les sèries
        for (let i = 0; i < timestamps.length; i++) {
            // Busquem les dades que corresponguin a aquest timestamp
            let dataFound = lastData.result.filter(o => o.windowEnd === timestampsUnixEpoch[i]);

            // De les dades recuperades mirem a quina sèrie corresponen (comparema amb el nom i period)
            for (let s = 0; s < series.length; s++) {
                // De les dades trobades ens quedem amb el primer indicador que pertanyi a la serie
                for (let j = 0; j < dataFound.length; j++) {
                    let indicatorFound = dataFound[j].indicatorValues.find(o => (o.name + o.period) === series[s].name);
                    if (indicatorFound) {
                        series[s].data[i] = indicatorFound.value;
                    }
                }
            }
        }

        // Guardem els valors a l'objecte i el passem al template
        dataToShow.xAxisCategories = JSON.stringify(timestamps);
        dataToShow.series = JSON.stringify(series);

        res.render('analysis', { 
            name: pjson.name, 
            version: pjson.version,
            data : dataToShow
        });
    } catch (e) {
        logger.error(e);
        res.render('analysis', { name: pjson.name, version: pjson.version, m_alert: e.message, data : dataToShow });
    }
});

module.exports = router;