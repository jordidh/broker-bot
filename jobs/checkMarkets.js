var schedule = require('node-schedule');

var config = require('../config/config');
var logger = require('../api/logger');

logger.info(config.jobs.checkMarkets.name + " cron planned at " + config.jobs.checkMarkets.schedule);
var job = schedule.scheduleJob(config.jobs.checkMarkets.schedule, function() {
    try {
        logger.info("Begin checking markets");
        config.jobs.checkMarkets.markets.forEach(function(market) {
            logger.info("Begin checking market");

            // TODO

            logger.info("End checking market");
        });
        logger.info("End checking markets");

    } catch (e) {
        logger.error("Exception: " + e.message);
    }
});
