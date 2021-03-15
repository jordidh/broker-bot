//const sqlite3 = require('sqlite3').verbose();
const sqlite = require("./sqlite3-await-async")

/**
 * Classe per guardar dades del bot de forma persistent
 * Es fa servir una BD SqLite
 * 
 * Es fa servir de la següent manera:
 * var BotPersistentData = require('./botPersistentData');
 * var botData = new BotPersistentData().getInstance();
 * botData.active = true;
 * let isActive = botData.active;
 */
class BotPersistentData {

    constructor() {
        this.active = false;
    }

    CheckDatabaseTables = async function() {
        try {
            // Tabla logs
            let sqlRes = await sqlite.run(`CREATE TABLE IF NOT EXISTS marketData (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                market TEXT NOT NULL,
                price REAL NOT NULL,
                windowStart REAL NOT NULL,
                windowEnd REAL NOT NULL,
                indicatorValues TEXT NOT NULL,
                decision TEXT NOT NULL
            )`);

            return {
                "error": [ ],
                "result": [ "Database checked successfully" ]
            }
        } catch (err) {
            return {
                "error": [ "Database checked with errors " + err.message ],
                "result": [ ]
            }
        }
    }

    /**
     * Funció que recuperem l'última dada emmagatzemada per aquest mercat
     * Retorna una cosa del tipus: {
     *   market : "id",
     *   windowStart : 1614933060,
     *   windowEnd : 1614945000,
     *   price : 34,
     *   indicatorValues : [
     *     { "name" : "DEMA", "period" : 20, "value" : 34 },
     *     { "name" : "DEMA", "period" : 50, "value" : 34 }
     *   ],
     *   decision : "realx"
     * }
     * @param {*} marketId : id del mercat que es recuperarà
     */
    getLastMarketData = async function(marketId) {
        try {
            let data = {};

            data = await sqlite.all(`SELECT * FROM marketData WHERE market = '` + marketId + `' ORDER BY windowEnd DESC LIMIT 1`);
            if (data && data != null && Array.isArray(data) && data.length > 0 && data[0].indicatorValues){
                data[0].indicatorValues = JSON.parse(data[0].indicatorValues);
                return {
                    "error" : [],
                    "result" : data[0]
                }
            } else {
                return {
                    "error" : [],
                    "result" : []
                }
            }
        } catch (err) {
            return {
                "error" : [ err ],
                "result" : []
            }
        }
    }

    /**
     * Funció que recuperem les últimes dades emmagatzemades per aquest mercat
     * Retorna una cosa del tipus: [{
     *   market : "id",
     *   windowStart : 1614933060,
     *   windowEnd : 1614945000,
     *   price : 34,
     *   indicatorValues : [
     *     { "name" : "DEMA", "period" : 20, "value" : 34 },
     *     { "name" : "DEMA", "period" : 50, "value" : 34 }
     *   ],
     *   decision : "realx"
     * },...]
     * @param {*} marketId : id del mercat que es recuperarà
     * @param {*} limit : numero màxim de dades que es recuperaran
     */
    getLastMarketDatasDesc = async function(marketId, limit) {
        try {
            let data = {};

            data = await sqlite.all(`SELECT * FROM marketData WHERE market = '` + marketId + `' ORDER BY windowEnd DESC LIMIT ` + limit);
            if (data && data != null && Array.isArray(data) && data.length > 0){
                // Parsegem a json en totes les dades obtingudes
                for (let i = 0; i < data.length; i++) {
                    data[i].indicatorValues = JSON.parse(data[i].indicatorValues);  
                }

                return {
                    "error" : [],
                    "result" : data
                }
            } else {
                return {
                    "error" : [],
                    "result" : []
                }
            }
        } catch (err) {
            return {
                "error" : [ err ],
                "result" : []
            }
        }
    }

    /**
     * Funció que recuperem les últimes dades emmagatzemades per aquest mercat
     * Retorna una cosa del tipus: [{
     *   market : "id",
     *   windowStart : 1614933060,
     *   windowEnd : 1614945000,
     *   price : 34,
     *   indicatorValues : [
     *     { "name" : "DEMA", "period" : 20, "value" : 34 },
     *     { "name" : "DEMA", "period" : 50, "value" : 34 }
     *   ],
     *   decision : "realx"
     * },...]
     * @param {*} marketId : id del mercat que es recuperarà
     * @param {*} limit : numero màxim de dades que es recuperaran
     */
    getLastMarketDatasAsc = async function(marketId, limit) {
        try {
            let data = {};

            data = await sqlite.all(`SELECT * FROM marketData WHERE market = '` + marketId + `' ORDER BY windowEnd DESC LIMIT ` + limit);
            if (data && data != null && Array.isArray(data) && data.length > 0){
                // Parsegem a json en totes les dades obtingudes
                for (let i = 0; i < data.length; i++) {
                    data[i].indicatorValues = JSON.parse(data[i].indicatorValues);  
                }

                return {
                    "error" : [],
                    // Li donem la volta per tenir-los en mode ascendent
                    "result" : data.reverse()
                }
            } else {
                return {
                    "error" : [],
                    "result" : []
                }
            }
        } catch (err) {
            return {
                "error" : [ err ],
                "result" : []
            }
        }
    }

    /**
     * Funció que guarda dades d'unmercat a la BD
     * @param {*} data : objecte del tipus: {
     *   market : "id",
     *   windowStart : 1614933060,
     *   windowEnd : 1614945000,
     *   price : 34,
     *   indicatorValues : [
     *     { "name" : "DEMA", "period" : 20, "value" : 34 },
     *     { "name" : "DEMA", "period" : 50, "value" : 34 }
     *   ],
     *   decision : "realx"
     * }
     */
    saveCurrentMarketData = async function(data) {
        try {
            let sql = `INSERT INTO marketData (market, windowStart, windowEnd, price, indicatorValues, decision) 
                       VALUES ('` + data.market + `',` + data.windowStart + `,` + data.windowEnd + `,` + price + `,'` + JSON.stringify(data.indicatorValues) + `'.'` + decision + `')`;

            let result = await sqlite.run(sql);

            return {
                "error" : [ ],
                "result" : result
            }
        } catch (err) {
            console.error(err);
            return {
                "error" : [ err ],
                "result" : []
            }
        }
    }


    /**
     * Funció que recupera els diferents mercats emmagatzemats
     */
    getMarkets = async function() {
        try {
            let sql = "SELECT DISTINCT market FROM marketData";
            let data = await sqlite.all(sql);
            if (data && data != null && Array.isArray(data) && data.length > 0){
                return {
                    "error" : [],
                    "result" : data
                }
            } else {
                return {
                    "error" : [],
                    "result" : []
                }
            }
        } catch (err) {
            console.error(err);
            return {
                "error" : [ err ],
                "result" : []
            }
        }
    }
}

class Singleton {

  constructor() {
        if (!Singleton.instance) {
            Singleton.instance = new BotPersistentData();
        }
    }

    getInstance() {
        return Singleton.instance;
    }
}

module.exports = Singleton;