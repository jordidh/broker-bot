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
                market INTEGER NOT NULL,
                windowStart INTEGER NOT NULL,
                windowEnd INTEGER NOT NULL,
                indicatorValues TEXT NOT NULL            
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
     *   indicatorValues : [
     *     { "name" : "DEMA", "period" : 20, "VALUE" : 34 },
     *     { "name" : "DEMA", "period" : 50, "VALUE" : 34 }
     *   ]
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
     * Funció que guarda dades d'unmercat a la BD
     * @param {*} data : objecte del tipus: {
     *   market : "id",
     *   windowStart : 1614933060,
     *   windowEnd : 1614945000,
     *   indicatorValues : [
     *     { "name" : "DEMA", "period" : 20, "VALUE" : 34 },
     *     { "name" : "DEMA", "period" : 50, "VALUE" : 34 }
     *   ]
     * }
     */
    saveCurrentMarketData = async function(data) {
        try {
            let sql = `INSERT INTO marketData (market, windowStart, windowEnd, indicatorValues) 
                       VALUES ('` + data.market + `',` + data.windowStart + `,` + data.windowEnd + `,'` + JSON.stringify(data.indicatorValues) + `')`;

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