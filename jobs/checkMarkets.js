var schedule = require('node-schedule');

var config = require('../config/config');
var logger = require('../api/logger');
const brokerControl = require('../../api/brokerControl');

logger.info(config.jobs.checkMarkets.name + " cron planned at " + config.jobs.checkMarkets.schedule);
var job = schedule.scheduleJob(config.jobs.checkMarkets.schedule, function() {
    try {
        logger.info("Begin checking markets");
        config.jobs.checkMarkets.markets.forEach(function(market) {
            logger.info("Begin checking market");

            // Comprovem que la funció indicada en la configuració existeix i és una funció
            // Important: aquesta funció ha d'estar a dins de api/brokerControl.js
            var fn = market.strategy.toString().trim();
            //if (fn in global && typeof global[fn] === "function") {
            if (fn in brokerControl && typeof brokerControl[fn] === "function") {
                // function exists, l'executem
                //global[fn]();
                brokerControl[fn](market);
            }
            else {
                // function does not exist
                logger.error("Error checking markets: Could not find configured " + fn + " function");
            }

            logger.info("End checking market");
        });
        logger.info("End checking markets");

    } catch (e) {
        logger.error("Exception checking markets: " + e.message);
    }
});
