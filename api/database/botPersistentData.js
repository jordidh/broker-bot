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
            let sqlRes = await sqlite.run(`CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATETIME NOT NULL,
                log TEXT NOT NULL            
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
     * Funció que guarda un log per la data i hora actual
     * @param {*} text : text que es guardarà en el log
     */
    AddLog = async function (text) {
        try {
            return await sqlite.run(`INSERT INTO logs (date, log) VALUES (datetime(),'` + text + `')`);
        } catch (err) {
            console.error(err);
            return err;
        }
    }

    GetLastLogs = async function (numLogs) {
        try {
            let sql = `SELECT * FROM logs ORDER BY date DESC LIMIT ` + numLogs;
            return await sqlite.all(sql);
        } catch (err) {
            console.error(err);
            return err;
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