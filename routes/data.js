"use strict";

/**
 * Module dependencies
 */
const logger = require('../api/logger');
const moment = require('moment');
const https = require('https');
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
        res.json([[1551882600000,43.67,43.87,43.49,43.63],[1551969000000,43.47,43.61,43.01,43.13],[1552055400000,42.58,43.27,42.38,43.23],[1552311000000,43.87,44.78,43.84,44.72],[1552397400000,45,45.67,44.84,45.23],[1552483800000,45.56,45.83,45.23,45.43],[1552570200000,45.97,46.03,45.64,45.93],[1552656600000,46.21,46.83,45.94,46.53],[1552915800000,46.45,47.1,46.45,47.01],[1553002200000,47.09,47.25,46.48,46.63],[1553088600000,46.56,47.37,46.18,47.04],[1553175000000,47.51,49.08,47.45,48.77],[1553261400000,48.83,49.42,47.69,47.76],[1553520600000,47.88,47.99,46.65,47.19],[1553607000000,47.92,48.22,46.15,46.7],[1553693400000,47.19,47.44,46.64,47.12],[1553779800000,47.24,47.39,46.88,47.18],[1553866200000,47.46,47.52,47.13,47.49],[1554125400000,47.91,47.92,47.1,47.81],[1554211800000,47.77,48.62,47.76,48.51],[1554298200000,48.31,49.13,48.29,48.84],[1554384600000,48.7,49.09,48.28,48.92],[1554471000000,49.11,49.28,48.98,49.25],[1554730200000,49.1,50.06,49.08,50.03],[1554816600000,50.08,50.71,49.81,49.88],[1554903000000,49.67,50.19,49.54,50.15],[1554989400000,50.21,50.25,49.61,49.74],[1555075800000,49.8,50.03,49.05,49.72],[1555335000000,49.65,49.96,49.5,49.81],[1555421400000,49.87,50.34,49.64,49.81],[1555507800000,49.88,50.85,49.65,50.78],[1555594200000,50.78,51.04,50.63,50.97],[1555939800000,50.71,51.24,50.58,51.13],[1556026200000,51.11,51.94,50.97,51.87],[1556112600000,51.84,52.12,51.76,51.79],[1556199000000,51.71,51.94,51.28,51.32],[1556285400000,51.22,51.25,50.53,51.08],[1556544600000,51.1,51.49,50.97,51.15],[1556631000000,50.76,50.85,49.78,50.17],[1556717400000,52.47,53.83,52.31,52.63],[1556803800000,52.46,53.16,52.03,52.29],[1556890200000,52.72,52.96,52.56,52.94],[1557149400000,51.07,52.21,50.88,52.12],[1557235800000,51.47,51.85,50.21,50.72],[1557322200000,50.47,51.33,50.44,50.72],[1557408600000,50.1,50.42,49.17,50.18],[1557495000000,49.35,49.71,48.19,49.29],[1557754200000,46.93,47.37,45.71,46.43],[1557840600000,46.6,47.42,46.35,47.17],[1557927000000,46.57,47.94,46.51,47.73],[1558013400000,47.48,48.12,47.21,47.52],[1558099800000,46.73,47.72,46.69,47.25],[1558359000000,45.88,46.09,45.07,45.77],[1558445400000,46.31,47,46.17,46.65],[1558531800000,46.17,46.43,45.64,45.69],[1558618200000,44.95,45.13,44.45,44.92],[1558704600000,45.05,45.53,44.65,44.74],[1559050200000,44.73,45.15,44.48,44.56],[1559136600000,44.1,44.84,44,44.35],[1559223000000,44.49,44.81,44.17,44.58],[1559309400000,44.06,44.5,43.75,43.77],[1559568600000,43.9,44.48,42.57,43.33],[1559655000000,43.86,44.96,43.63,44.91],[1559741400000,46.07,46.25,45.28,45.63],[1559827800000,45.77,46.37,45.54,46.31],[1559914200000,46.63,47.98,46.44,47.54],[1560173400000,47.95,48.84,47.9,48.15],[1560259800000,48.72,49,48.4,48.7],[1560346200000,48.49,48.99,48.35,48.55],[1560432600000,48.67,49.2,48.4,48.54],[1560519000000,47.89,48.4,47.58,48.19],[1560778200000,48.22,48.74,48.04,48.47],[1560864600000,49.01,50.07,48.8,49.61],[1560951000000,49.92,49.97,49.33,49.47],[1561037400000,50.09,50.15,49.51,49.87],[1561123800000,49.7,50.21,49.54,49.69],[1561383000000,49.63,50.04,49.54,49.65],[1561469400000,49.61,49.81,48.82,48.89],[1561555800000,49.44,50.25,49.34,49.95],[1561642200000,50.07,50.39,49.89,49.94],[1561728600000,49.67,49.88,49.26,49.48],[1561987800000,50.79,51.12,50.16,50.39],[1562074200000,50.35,50.78,50.34,50.68],[1562160600000,50.82,51.11,50.67,51.1],[1562333400000,50.84,51.27,50.72,51.06],[1562592600000,50.2,50.35,49.6,50.01],[1562679000000,49.8,50.38,49.7,50.31],[1562765400000,50.46,50.93,50.39,50.81],[1562851800000,50.83,51.1,50.43,50.44],[1562938200000,50.61,51,50.55,50.83],[1563197400000,51.02,51.47,51,51.3],[1563283800000,51.15,51.53,50.88,51.13],[1563370200000,51.01,51.27,50.82,50.84],[1563456600000,51,51.47,50.92,51.42],[1563543000000,51.45,51.63,50.59,50.65],[1563802200000,50.91,51.81,50.9,51.81],[1563888600000,52.12,52.23,51.82,52.21],[1563975000000,51.92,52.29,51.79,52.17],[1564061400000,52.22,52.31,51.68,51.76],[1564147800000,51.87,52.43,51.78,51.94],[1564407000000,52.12,52.66,52.11,52.42],[1564493400000,52.19,52.54,51.83,52.19],[1564579800000,54.1,55.34,52.83,53.26],[1564666200000,53.47,54.51,51.69,52.11],[1564752600000,51.38,51.61,50.41,51.01],[1565011800000,49.5,49.66,48.15,48.33],[1565098200000,49.08,49.52,48.51,49.25],[1565184600000,48.85,49.89,48.46,49.76],[1565271000000,50.05,50.88,49.85,50.86],[1565357400000,50.33,50.69,49.82,50.25],[1565616600000,49.9,50.51,49.79,50.12],[1565703000000,50.26,53.03,50.12,52.24],[1565789400000,50.79,51.61,50.65,50.69],[1565875800000,50.87,51.28,49.92,50.44],[1565962200000,51.07,51.79,50.96,51.63],[1566221400000,52.65,53.18,52.51,52.59],[1566307800000,52.72,53.34,52.58,52.59],[1566394200000,53.25,53.41,52.9,53.16],[1566480600000,53.3,53.61,52.69,53.12],[1566567000000,52.36,53.01,50.25,50.66],[1566826200000,51.47,51.8,51.26,51.62],[1566912600000,51.97,52.14,50.88,51.04],[1566999000000,51.03,51.43,50.83,51.38],[1567085400000,52.13,52.33,51.67,52.25],[1567171800000,52.54,52.61,51.8,52.19],[1567517400000,51.61,51.74,51.06,51.42],[1567603800000,52.1,52.37,51.83,52.3],[1567690200000,53,53.49,52.88,53.32],[1567776600000,53.51,53.6,53.13,53.31],[1568035800000,53.71,54.11,52.77,53.54],[1568122200000,53.47,54.19,52.93,54.17],[1568208600000,54.52,55.93,54.43,55.9],[1568295000000,56.2,56.6,55.72,55.77],[1568381400000,55,55.2,54.26,54.69],[1568640600000,54.43,55.03,54.39,54.97],[1568727000000,54.99,55.21,54.78,55.17],[1568813400000,55.26,55.71,54.86,55.69],[1568899800000,55.5,55.94,55.09,55.24],[1568986200000,55.35,55.64,54.37,54.43],[1569245400000,54.74,54.96,54.41,54.68],[1569331800000,55.26,55.62,54.3,54.42],[1569418200000,54.64,55.38,54.28,55.26],[1569504600000,55,55.24,54.71,54.97],[1569591000000,55.13,55.24,54.32,54.71],[1569850200000,55.22,56.15,55.2,55.99],[1569936600000,56.27,57.06,56.05,56.15],[1570023000000,55.76,55.9,54.48,54.74],[1570109400000,54.61,55.24,53.78,55.21],[1570195800000,56.41,56.87,55.97,56.75],[1570455000000,56.57,57.48,56.46,56.76],[1570541400000,56.46,57.01,56.08,56.1],[1570627800000,56.76,56.95,56.41,56.76],[1570714200000,56.98,57.61,56.83,57.52],[1570800600000,58.24,59.41,58.08,59.05],[1571059800000,58.72,59.53,58.67,58.97],[1571146200000,59.1,59.41,58.72,58.83],[1571232600000,58.34,58.81,58.3,58.59],[1571319000000,58.77,59.04,58.38,58.82],[1571405400000,58.65,59.4,58.57,59.1],[1571664600000,59.38,60.25,59.33,60.13],[1571751000000,60.29,60.55,59.9,59.99],[1571837400000,60.53,60.81,60.31,60.79],[1571923800000,61.13,61.2,60.45,60.9],[1572010200000,60.79,61.68,60.72,61.65],[1572269400000,61.85,62.31,61.68,62.26],[1572355800000,62.24,62.44,60.64,60.82],[1572442200000,61.19,61.33,60.3,60.81],[1572528600000,61.81,62.29,59.31,62.19],[1572615000000,62.38,63.98,62.29,63.96],[1572877800000,64.33,64.46,63.85,64.38],[1572964200000,64.26,64.55,64.08,64.28],[1573050600000,64.19,64.37,63.84,64.31],[1573137000000,64.68,65.09,64.53,64.86],[1573223400000,64.67,65.11,64.21,65.04],[1573482600000,64.57,65.62,64.57,65.55],[1573569000000,65.39,65.7,65.23,65.49],[1573655400000,65.28,66.19,65.27,66.12],[1573741800000,65.94,66.22,65.53,65.66],[1573828200000,65.92,66.44,65.75,66.44],[1574087400000,66.45,66.86,66.06,66.78],[1574173800000,66.97,67,66.35,66.57],[1574260200000,66.39,66.52,65.1,65.8],[1574346600000,65.92,66,65.29,65.5],[1574433000000,65.65,65.79,65.21,65.44],[1574692200000,65.68,66.61,65.63,66.59],[1574778600000,66.74,66.79,65.63,66.07],[1574865000000,66.39,67,66.33,66.96],[1575037800000,66.65,67,66.47,66.81],[1575297000000,66.82,67.06,65.86,66.04],[1575383400000,64.58,64.88,64.07,64.86],[1575469800000,65.27,65.83,65.17,65.43],[1575556200000,65.95,66.47,65.68,66.39],[1575642600000,66.87,67.75,66.82,67.68],[1575901800000,67.5,67.7,66.23,66.73],[1575988200000,67.15,67.52,66.46,67.12],[1576074600000,67.2,67.78,67.13,67.69],[1576161000000,66.94,68.14,66.83,67.86],[1576247400000,67.86,68.82,67.73,68.79],[1576506600000,69.25,70.2,69.25,69.96],[1576593000000,69.89,70.44,69.7,70.1],[1576679400000,69.95,70.47,69.78,69.93],[1576765800000,69.88,70.29,69.74,70],[1576852200000,70.56,70.66,69.64,69.86],[1577111400000,70.13,71.06,70.09,71],[1577197800000,71.17,71.22,70.73,71.07],[1577370600000,71.21,72.5,71.18,72.48],[1577457000000,72.78,73.49,72.03,72.45],[1577716200000,72.36,73.17,71.31,72.88],[1577802600000,72.48,73.42,72.38,73.41],[1577975400000,74.06,75.15,73.8,75.09],[1578061800000,74.29,75.14,74.13,74.36],[1578321000000,73.45,74.99,73.19,74.95],[1578407400000,74.96,75.22,74.37,74.6],[1578493800000,74.29,76.11,74.29,75.8],[1578580200000,76.81,77.61,76.55,77.41],[1578666600000,77.65,78.17,77.06,77.58],[1578925800000,77.91,79.27,77.79,79.24],[1579012200000,79.18,79.39,78.04,78.17],[1579098600000,77.96,78.88,77.39,77.83],[1579185000000,78.4,78.93,78.02,78.81],[1579271400000,79.07,79.68,78.75,79.68],[1579617000000,79.3,79.75,79,79.14],[1579703400000,79.64,80,79.33,79.43],[1579789800000,79.48,79.89,78.91,79.81],[1579876200000,80.06,80.83,79.38,79.58],[1580135400000,77.51,77.94,76.22,77.24],[1580221800000,78.15,79.6,78.05,79.42],[1580308200000,81.11,81.96,80.35,81.08],[1580394600000,80.14,81.02,79.69,80.97],[1580481000000,80.23,80.67,77.07,77.38],[1580740200000,76.07,78.37,75.56,77.17],[1580826600000,78.83,79.91,78.41,79.71],[1580913000000,80.88,81.19,79.74,80.36],[1580999400000,80.64,81.31,80.07,81.3],[1581085800000,80.59,80.85,79.5,80.01],[1581345000000,78.54,80.39,78.46,80.39],[1581431400000,80.9,80.97,79.68,79.9],[1581517800000,80.37,81.81,80.37,81.8],[1581604200000,81.05,81.56,80.84,81.22],[1581690600000,81.18,81.5,80.71,81.24],[1582036200000,78.84,79.94,78.65,79.75],[1582122600000,80,81.14,80,80.9],[1582209000000,80.66,81.16,79.55,80.07],[1582295400000,79.65,80.11,77.63,78.26],[1582554600000,74.32,76.04,72.31,74.54],[1582641000000,75.24,75.63,71.53,72.02],[1582727400000,71.63,74.47,71.63,73.16],[1582813800000,70.28,71.5,68.24,68.38],[1582900200000,64.32,69.6,64.09,68.34],[1583159400000,70.57,75.36,69.43,74.7],[1583245800000,75.92,76,71.45,72.33],[1583332200000,74.11,75.85,73.28,75.68],[1583418600000,73.88,74.89,72.85,73.23],[1583505000000,70.5,72.71,70.31,72.26],[1583760600000,65.94,69.52,65.75,66.54],[1583847000000,69.29,71.61,67.34,71.33],[1583933400000,69.35,70.31,67.96,68.86],[1584019800000,63.99,67.5,62,62.06],[1584106200000,66.22,69.98,63.24,69.49],[1584365400000,60.49,64.77,60,60.55],[1584451800000,61.88,64.4,59.6,63.22],[1584538200000,59.94,62.5,59.28,61.67],[1584624600000,61.85,63.21,60.65,61.19],[1584711000000,61.79,62.96,57,57.31],[1584970200000,57.02,57.13,53.15,56.09],[1585056600000,59.09,61.92,58.58,61.72],[1585143000000,62.69,64.56,61.08,61.38],[1585229400000,61.63,64.67,61.59,64.61],[1585315800000,63.19,63.97,61.76,61.94],[1585575000000,62.69,63.88,62.35,63.7],[1585661400000,63.9,65.62,63,63.57],[1585747800000,61.63,62.18,59.78,60.23],[1585834200000,60.08,61.29,59.22,61.23],[1585920600000,60.7,61.42,59.74,60.35],[1586179800000,62.72,65.78,62.35,65.62],[1586266200000,67.7,67.93,64.75,64.86],[1586352600000,65.68,66.84,65.31,66.52],[1586439000000,67.18,67.52,66.18,67],[1586784600000,67.08,68.43,66.46,68.31],[1586871000000,70,72.06,69.51,71.76],[1586957400000,70.6,71.58,70.16,71.11],[1587043800000,71.85,72.05,70.59,71.67],[1587130200000,71.17,71.74,69.21,70.7],[1587389400000,69.49,70.42,69.21,69.23],[1587475800000,69.07,69.31,66.36,67.09],[1587562200000,68.4,69.47,68.05,69.03],[1587648600000,68.97,70.44,68.72,68.76],[1587735000000,69.3,70.75,69.25,70.74],[1587994200000,70.45,71.14,69.99,70.79],[1588080600000,71.27,71.46,69.55,69.64],[1588167000000,71.18,72.42,70.97,71.93],[1588253400000,72.49,73.63,72.09,73.45],[1588339800000,71.56,74.75,71.46,72.27],[1588599000000,72.29,73.42,71.58,73.29],[1588685400000,73.76,75.25,73.61,74.39],[1588771800000,75.11,75.81,74.72,75.16],[1588858200000,75.81,76.29,75.49,75.93],[1588944600000,76.41,77.59,76.07,77.53],[1589203800000,77.03,79.26,76.81,78.75],[1589290200000,79.46,79.92,77.73,77.85],[1589376600000,78.04,78.99,75.8,76.91],[1589463000000,76.13,77.45,75.38,77.39],[1589549400000,75.09,76.97,75.05,76.93],[1589808600000,78.29,79.13,77.58,78.74],[1589895000000,78.76,79.63,78.25,78.29],[1589981400000,79.17,79.88,79.13,79.81],[1590067800000,79.67,80.22,78.97,79.21],[1590154200000,78.94,79.81,78.84,79.72],[1590499800000,80.88,81.06,79.13,79.18],[1590586200000,79.04,79.68,78.27,79.53],[1590672600000,79.19,80.86,78.91,79.56],[1590759000000,79.81,80.29,79.12,79.49],[1591018200000,79.44,80.59,79.3,80.46],[1591104600000,80.19,80.86,79.73,80.83],[1591191000000,81.17,81.55,80.57,81.28],[1591277400000,81.1,81.4,80.19,80.58],[1591363800000,80.84,82.94,80.81,82.88],[1591623000000,82.56,83.4,81.83,83.36],[1591709400000,83.04,86.4,83,86],[1591795800000,86.97,88.69,86.52,88.21],[1591882200000,87.33,87.76,83.87,83.97],[1591968600000,86.18,86.95,83.56,84.7],[1592227800000,83.31,86.42,83.14,85.75],[1592314200000,87.86,88.3,86.18,88.02],[1592400600000,88.79,88.85,87.77,87.9],[1592487000000,87.85,88.36,87.31,87.93],[1592573400000,88.66,89.14,86.29,87.43],[1592832600000,87.83,89.86,87.79,89.72],[1592919000000,91,93.1,90.57,91.63],[1593005400000,91.25,92.2,89.63,90.01],[1593091800000,90.18,91.25,89.39,91.21],[1593178200000,91.1,91.33,88.25,88.41],[1593437400000,88.31,90.54,87.82,90.44],[1593523800000,90.02,91.5,90,91.2],[1593610200000,91.28,91.84,90.98,91.03],[1593696600000,91.96,92.62,90.91,91.03],[1594042200000,92.5,93.94,92.47,93.46],[1594128600000,93.85,94.65,93.06,93.17],[1594215000000,94.18,95.38,94.09,95.34],[1594301400000,96.26,96.32,94.67,95.75],[1594387800000,95.33,95.98,94.71,95.92],[1594647000000,97.26,99.96,95.26,95.48],[1594733400000,94.84,97.25,93.88,97.06],[1594819800000,98.99,99.25,96.49,97.72],[1594906200000,96.56,97.4,95.9,96.52],[1594992600000,96.99,97.15,95.84,96.33],[1595251800000,96.42,98.5,96.06,98.36],[1595338200000,99.17,99.25,96.74,97],[1595424600000,96.69,97.97,96.6,97.27],[1595511000000,97,97.08,92.01,92.85],[1595597400000,90.99,92.97,89.14,92.61],[1595856600000,93.71,94.9,93.48,94.81],[1595943000000,94.37,94.55,93.25,93.25],[1596029400000,93.75,95.23,93.71,95.04],[1596115800000,94.19,96.3,93.77,96.19],[1596202200000,102.89,106.42,100.82,106.26],[1596461400000,108.2,111.64,107.89,108.94],[1596547800000,109.13,110.79,108.39,109.67],[1596634200000,109.38,110.39,108.9,110.06],[1596720600000,110.4,114.41,109.8,113.9],[1596807000000,113.21,113.68,110.29,111.11],[1597066200000,112.6,113.78,110,112.73],[1597152600000,111.97,112.48,109.11,109.38],[1597239000000,110.5,113.28,110.3,113.01],[1597325400000,114.43,116.04,113.93,115.01],[1597411800000,114.83,115,113.04,114.91],[1597671000000,116.06,116.09,113.96,114.61],[1597757400000,114.35,116,114.01,115.56],[1597843800000,115.98,117.16,115.61,115.71],[1597930200000,115.75,118.39,115.73,118.28],[1598016600000,119.26,124.87,119.25,124.37],[1598275800000,128.7,128.79,123.94,125.86],[1598362200000,124.7,125.18,123.05,124.82],[1598448600000,126.18,126.99,125.08,126.52],[1598535000000,127.14,127.49,123.83,125.01],[1598621400000,126.01,126.44,124.58,124.81],[1598880600000,127.58,131,126,129.04],[1598967000000,132.76,134.8,130.53,134.18],[1599053400000,137.59,137.98,127,131.4],[1599139800000,126.91,128.84,120.5,120.88],[1599226200000,120.07,123.7,110.89,120.96],[1599571800000,113.95,118.99,112.68,112.82],[1599658200000,117.26,119.14,115.26,117.32],[1599744600000,120.36,120.5,112.5,113.49],[1599831000000,114.57,115.23,110,112],[1600090200000,114.72,115.93,112.8,115.36],[1600176600000,118.33,118.83,113.61,115.54],[1600263000000,115.23,116,112.04,112.13],[1600349400000,109.72,112.2,108.71,110.34],[1600435800000,110.4,110.88,106.09,106.84],[1600695000000,104.54,110.19,103.1,110.08],[1600781400000,112.68,112.86,109.16,111.81],[1600867800000,111.62,112.11,106.77,107.12],[1600954200000,105.17,110.25,105,108.22],[1601040600000,108.43,112.44,107.67,112.28],[1601299800000,115.01,115.32,112.78,114.96],[1601386200000,114.55,115.31,113.57,114.09],[1601472600000,113.79,117.26,113.62,115.81],[1601559000000,117.64,117.72,115.83,116.79],[1601645400000,112.89,115.37,112.22,113.02],[1601904600000,113.91,116.65,113.55,116.5],[1601991000000,115.7,116.12,112.25,113.16],[1602077400000,114.62,115.55,114.13,115.08],[1602163800000,116.25,116.4,114.59,114.97],[1602250200000,115.28,117,114.92,116.97],[1602509400000,120.06,125.18,119.28,124.4],[1602595800000,125.27,125.39,119.65,121.1],[1602682200000,121,123.03,119.62,121.19],[1602768600000,118.72,121.2,118.15,120.71],[1602855000000,121.28,121.55,118.81,119.02],[1603114200000,119.96,120.42,115.66,115.98],[1603200600000,116.2,118.98,115.63,117.51],[1603287000000,116.67,118.71,116.45,116.87],[1603373400000,117.45,118.04,114.59,115.75],[1603459800000,116.39,116.55,114.28,115.04],[1603719000000,114.01,116.55,112.88,115.05],[1603805400000,115.49,117.28,114.54,116.6],[1603891800000,115.05,115.43,111.1,111.2],[1603978200000,112.37,116.93,112.2,115.32],[1604064600000,111.06,111.99,107.72,108.86],[1604327400000,109.11,110.68,107.32,108.77],[1604413800000,109.66,111.49,108.73,110.44],[1604500200000,114.14,115.59,112.35,114.95],[1604586600000,117.95,119.62,116.87,119.03],[1604673000000,118.32,119.2,116.13,118.69],[1604932200000,120.5,121.99,116.05,116.32],[1605018600000,115.55,117.59,114.13,115.97],[1605105000000,117.19,119.63,116.44,119.49],[1605191400000,119.62,120.53,118.57,119.21],[1605277800000,119.44,119.67,117.87,119.26],[1605537000000,118.92,120.99,118.15,120.3],[1605623400000,119.55,120.67,118.96,119.39],[1605709800000,118.61,119.82,118,118.03],[1605796200000,117.59,119.06,116.81,118.64],[1605882600000,118.64,118.77,117.29,117.34],[1606141800000,117.18,117.62,113.75,113.85],[1606228200000,113.91,115.85,112.59,115.17],[1606314600000,115.55,116.75,115.17,116.03],[1606487400000,116.57,117.49,116.22,116.59],[1606746600000,116.97,120.97,116.81,119.05],[1606833000000,121.01,123.47,120.01,122.72],[1606919400000,122.02,123.37,120.89,123.08],[1607005800000,123.52,123.78,122.21,122.94],[1607092200000,122.6,122.86,121.52,122.25],[1607351400000,122.31,124.57,122.25,123.75],[1607437800000,124.37,124.98,123.09,124.38],[1607524200000,124.53,125.95,121,121.78],[1607610600000,120.5,123.87,120.15,123.24],[1607697000000,122.43,122.76,120.55,122.41],[1607956200000,122.6,123.35,121.54,121.78],[1608042600000,124.34,127.9,124.13,127.88],[1608129000000,127.41,128.37,126.56,127.81],[1608215400000,128.9,129.58,128.04,128.7],[1608301800000,128.96,129.1,126.12,126.66],[1608561000000,125.02,128.31,123.45,128.23],[1608647400000,131.61,134.41,129.65,131.88],[1608733800000,132.16,132.43,130.78,130.96],[1608820200000,131.32,133.46,131.1,131.97],[1609165800000,133.99,137.34,133.51,136.69],[1609252200000,138.05,138.79,134.34,134.87],[1609338600000,135.58,135.99,133.4,133.72],[1609425000000,134.08,134.74,131.72,132.69],[1609770600000,133.52,133.61,126.76,129.41],[1609857000000,128.89,131.74,128.43,131.01],[1609943400000,127.72,131.05,126.38,126.6],[1610029800000,128.36,131.63,127.86,130.92],[1610116200000,132.43,132.63,130.23,132.05],[1610375400000,129.19,130.17,128.5,128.98],[1610461800000,128.5,129.69,126.86,128.8],[1610548200000,128.76,131.45,128.49,130.89],[1610634600000,130.8,131,128.76,128.91],[1610721000000,128.78,130.22,127,127.14],[1611066600000,127.78,128.71,126.94,127.83],[1611153000000,128.66,132.49,128.55,132.03],[1611239400000,133.8,139.67,133.59,136.87],[1611325800000,136.28,139.85,135.02,139.07],[1611585000000,143.07,145.09,136.54,142.92],[1611671400000,143.6,144.3,141.37,143.16],[1611757800000,143.43,144.3,140.41,142.06],[1611844200000,139.52,141.99,136.7,137.09],[1611930600000,135.83,136.74,130.21,131.96],[1612189800000,133.75,135.38,130.93,134.14],[1612276200000,135.73,136.31,134.61,134.99],[1612362600000,135.76,135.77,133.61,133.94],[1612449000000,136.3,137.4,134.59,137.39],[1612535400000,137.35,137.42,135.86,136.76],[1612794600000,136.03,136.96,134.92,136.91],[1612881000000,136.62,137.88,135.85,136.01],[1612967400000,136.48,136.99,134.4,135.39],[1613053800000,135.9,136.39,133.77,135.13],[1613140200000,134.35,135.53,133.69,135.37],[1613485800000,135.49,136.01,132.79,133.19],[1613572200000,131.25,132.22,129.47,130.84],[1613658600000,129.2,130,127.41,129.71],[1613745000000,130.24,130.71,128.8,129.87],[1614004200000,128.01,129.72,125.6,126],[1614090600000,123.76,126.71,118.39,125.86],[1614177000000,124.94,125.56,122.23,125.35],[1614263400000,124.68,126.46,120.54,120.99],[1614349800000,122.59,124.85,121.2,121.26],[1614609000000,123.75,127.93,122.79,127.79],[1614695400000,128.41,128.72,125.01,125.12],[1614781800000,124.81,125.71,121.84,122.06],[1614868200000,121.75,123.6,118.62,120.13],[1614954600000,120.98,121.94,117.57,121.42]]);
    } catch (e) {
        logger.error(e);
        res.render('index', { name: pjson.name, version: pjson.version, m_alert: e.message });
    }
});

router.get('/kraken', function (req, res, next) {
    let postId = uuidv1();

    // Enviem missatge al telegram de l'usuari per indicar que hem rebut un post
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    logger.info(postId + `: Rebut GET des de ` + ip);

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
        https.get('https://api.kraken.com/0/public/OHLC?pair=BTCEUR&interval=5', (resp) => {
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
                let dataWithChartFormat = jsonReceived.result.XXBTZEUR.map(function(element) {
                    return [
                        element[0],
                        parseFloat(element[1]),
                        parseFloat(element[2]),
                        parseFloat(element[3]),
                        parseFloat(element[4])
                    ];
                });

                //console.log(dataWithChartFormat);

                //
                res.json(dataWithChartFormat);
            });
        }).on('error', (err) => {
            logger.error("Error in GET to krakenapi ", err);
        });
    } catch (e) {
        logger.error(e);
        res.render('index', { name: pjson.name, version: pjson.version, m_alert: e.message });
    }
});

module.exports = router;