var schedule = require('node-schedule');

var config = require('../config/config');
var logger = require('../api/logger');
const brokerControl = require('../api/brokerControl');
var BotPersistentData = require('../api/database/botPersistentData');

const decisionMaker = require('../api/decisionMakers/demax2');

logger.info(config.jobs.checkMarkets.name + " cron planned at " + config.jobs.checkMarkets.schedule);
var job = schedule.scheduleJob(config.jobs.checkMarkets.schedule, function() {
    try {
        checkMarket(config.jobs.checkMarkets.markets);
    } catch (e) {
        logger.error("Exception checking markets: " + e.message);
    }
});


async function checkMarket(markets) {
    logger.info("Begin checking markets");

    // Tractem els mercats en paralel
    await Promise.all(markets.map(async (market) => {
        logger.info("Begin checking market " + market.id);

        // Comprovem que la funció indicada en la configuració existeix i és una funció
        // Important: aquesta funció ha d'estar a dins de api/brokerControl.js
        //var fn = market.strategy.toString().trim();
        //if (!(fn in brokerControl) || (typeof brokerControl[fn] != "function")) {
        //    logger.error("Error checking markets: Could not find configured " + fn + " function");
        //    return;
        //    
        //}

        // Recuperem o creem una instància del bot
        let botData = new BotPersistentData().getInstance();
        // Recuperem últimes dades emmagatzemades per aquest mercat
        // Retorna una cosa del tipus: {
        //   market : "id",
        //   windowStart : 1614933060,
        //   windowEnd : 1614945000,
        //   indicatorValues : [
        //     { "name" : "DEMA", "period" : 20, "value" : 34 },
        //     { "name" : "DEMA", "period" : 50, "value" : 34 }
        //   ]
        // }
        let lastData = await botData.getLastMarketData(market.id);
        // Si no hem trovat dades suposem que és que és el primer cop, en aquest cas no avaluem i ho deixem per la propera
        if (lastData.error.length > 0) {
            logger.error("checking markets, error accessing database for market.id = " + market.id + ": " + lastData.error[0]);
            return;
        }

        // Obtenim les dades de kraken des de l'inici de l'última finestra 
        // (així deixem marge per calcular els indicadors correctament)
        // Si no s'ha pogut obtenir les últimes dades recuperem tot el que ens envii l'exchange
        let url = market.api;
        // Sempre demanem totes les dades, ja que segons l'interval que es faci servir pot ser que ens quedem curts
        // No és el mateix demanar uninterval horari que de 5 minuts, segons cada cas s'hauria de demanar dades des d'un
        // punt inicial (since) diferent, per simplificar les demanem totes
        // Si la diferència entra windowStart i windowEnd és molt petita (menys de 10 minuts) posem windowStart = 0
        //if ((lastData.result.windowEnd - lastData.result.windowStart) <  60000) {
        //    lastData.result.windowStart = lastData.result.windowEnd - 60000;
        //}
        //if (lastData && lastData.result) {
        //    url = market.api + "&since=" + lastData.result.windowStart;
        //}
        logger.info("URL to find prices = " + url);

        let prices = await brokerControl.getPricesFromURL(url);
        if (prices.error.length > 0) {
            logger.error("checking markets, error getting prices from " + url + ": " + process.error[0]);
            return;
        }
        logger.info("Prices length = " + ((prices && prices.result) ? prices.result.length : 0));

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
        let decision = await brokerControl.checkAndDecide(market, lastData.result, prices.result, decisionMaker);
        logger.info("Decisions result = " + JSON.stringify(decision));

        // Emmagatzemem les dades obtingudes
        let saveCurrentData = await botData.saveCurrentMarketData(decision.result.currentData);
        if (saveCurrentData.error.length > 0) {
            logger.error("checking markets, error accessing database to save current data for market.id = " + market.id + ": " + decision.result.currentData);
            return;
        }

        if (decision.result.currentData.decision !== "relax") {
            // Enviem post als bots
            //market.tradingBots.forEach(bot => {
            //    // Fem post
            //    let postResult = await brokerControl.postToTradingBot(bot, decision.result.currentData.decision);
            //});

            // Fem un post en paralel
            await Promise.all(market.tradingBots.map(async (bot) => {
                // Fem post
                let postResult = await brokerControl.postToTradingBot(bot, decision.result.currentData.decision);
                if (postResult && postResult.error && postResult.error.length > 0) {
                    logger.error("checking markets, error posting to bot " + bot.url + ": " + postResult.error[0]);
                } else {
                    logger.info("checking markets posting to bot " + bot.url + ": " + JSON.stringify(postResult));
                }
            }));
        }

        logger.info("End checking market");  
    }));
}
