/**
 * Module dependencies
 */
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = new express();
var logger = require('./api/logger');
var index = require('./routes/index');

// Database
var BotPersistentData = require('./api/database/botPersistentData');

// Recuperem o creem una instància del bot
let botData = new BotPersistentData().getInstance();
// Funció que carrega totes les dades del bot
let loadBotData = async function() {
    logger.info("Checking database ...");
    let checkResult = await botData.CheckDatabaseTables();
    if (checkResult.error && checkResult.error.length > 0) {
        logger.error(checkResult.error[0]);
    } else {
        logger.info("Checking database = " + checkResult.result[0]);
    }
}
// Executem la funció de càrrega de dades
loadBotData();

// JOBs
var checkMarkets = require('./jobs/checkMarkets');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('trust proxy', true); //Required for APP ENGINE HTTPS with Express

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/log', log);
app.use('/', index);

//extractUserStats.getVersion();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    //var err = new Error('Not Found');
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    var err = new Error('Not Found ' + fullUrl);
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;