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


router.get('/', function (req, res, next) {
    let postId = uuidv1();

    // Enviem missatge al telegram de l'usuari per indicar que hem rebut un post
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    logger.info(postId + `: Rebut GET des de ` + ip);

    try {
        res.render('index', { name: pjson.name, version: pjson.version});
    } catch (e) {
        logger.error(e);
        res.render('index', { name: pjson.name, version: pjson.version, m_alert: e.message });
    }
});

router.get('/dashboard', function (req, res, next) {
    let postId = uuidv1();

    // Enviem missatge al telegram de l'usuari per indicar que hem rebut un post
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    logger.info(postId + `: Rebut GET des de ` + ip);

    try {
        res.render('dashboard', { name: pjson.name, version: pjson.version, views: config.dashboard.views });
    } catch (e) {
        logger.error(e);
        res.render('dashboard', { name: pjson.name, version: pjson.version, m_alert: e.message });
    }
});

module.exports = router;