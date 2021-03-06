"use strict";

/**
 * Module dependencies
 */
var config = require('../../../config/config')
const logger = require('../../logger')
const KrakenClient = require('kraken-api')
//const krakenAPI = new KrakenClient(config.EXCHANGE_KRAKEN.API_KEY, config.EXCHANGE_KRAKEN.API_SECRET)
const krakenAPI = new KrakenClient();

/**
 * Get account balance
 * URL: https://api.kraken.com/0/private/Balance
 * Result: array of asset names and balance amount
 */
exports.getBalance = async function () {
    try {
        // Recuperem el balanç de l'usuari
        // Ens retorna una cosa com: { 
        //   "error": [ "", "", ...], 
        //   "result" : [
        //                "ZUSD" : [3415.8014],
        //                "ZEUR" : [155.5649],
        //                "XXBT" : [149.9688412800],
        //                "XXRP" : [499889.51600000],
        //                ...
        //   ]
        let balance = await krakenAPI.api('Balance');
        return balance;
        
        /*
        if (Object.entries(data.result).length > 0) {
            let result = ''
            let sum = []
            for (var i = 0; i < Object.entries(data.result).length; i++) {
                let asset = Object.entries(data.result)[i][0]
                let asset_balance = parseFloat(Object.entries(data.result)[i][1]).toFixed(2)
                let pair = getTicker(asset)
                let current_price = null
                if (pair) {
                    //console.log("Ticker = " + pair)
                    let priceData = await krakenAPI.api('Ticker', { pair: pair })
                    current_price = parseFloat((convertPriceData(priceData, pair)).askPrice).toFixed(2)
                    //console.log("Price = " + current_price)
                }
                let coinname = getCoinName(asset)
                //console.log("coiname = " + coinname)
                let balance = parseFloat(current_price ? (current_price * asset_balance) : asset_balance).toFixed(2)
                //console.log("balance = " + balance)
                sum.push(balance)
                result += coinname + '(' + asset + ')' + ': ' + balance + '€ ' + (current_price ? ' (' + current_price + '€)' : '') + '\n'
            }
            // Total balance
            let total = sum.map(c => parseFloat(c)).reduce((a, b) => a + b, 0).toFixed(2)
            result += '\nTotal balance: ' + total + ' €'
            return result
        } else {
            return `❌ BALANCE NO ENCONTRADO!`
        }
        */
    }
    catch (err) {
        logger.error(err.message)
        return { 
            "error" : [ err.message ], 
            "result" : { }
        };
    }
}

/**
 * Get account funds in a specific currency
 * URL: https://api.kraken.com/0/private/Balance
 * Result: { 
 *   "error" : [ float of funds available ],
 *   "result" : { .. }
 *   "funds": 0
 * }
 * @param {*} currency : "ZEUR" / "ZUSD"
 */
/*
exports.getFunds = async function (currency) {
    try {
        // Recuperem el balanç de l'usuari
        // Ens retorna una cosa com: { 
        //   "error": [ "", "", ...], 
        //   "result" : [
        //                "ZUSD" : [3415.8014],
        //                "ZEUR" : [155.5649],
        //                "XXBT" : [149.9688412800],
        //                "XXRP" : [499889.51600000],
        //                "XLTC"
        //                "XXLM"
        //                "XETH"
        //                "XXMR"
        //                "ADA"   <------------------ NO PORTA X
        //                "LINK"  <------------------ NO PORTA X
        //                "KSM"   <------------------ NO PORTA X
        //                "KSM.S" <------------------ NO PORTA X
        //                "UNI"   <------------------ NO PORTA X
        //   ]
        let balance = await krakenAPI.api('Balance');

        // Si s'ha retornat un error
        if (balance && balance.error && Array.isArray(balance.error) && balance.error.length > 0) {
            logger.error("Error calling krakenAPI Balance: " + balance.error);
            return { 
                "error" : [ balance.error[0] ], 
                "result" : { 
                    "funds" : 0
                }
            };
        }

        // Si no hi ha fons
        if (typeof balance === "undefined" || balance === null || 
            typeof balance.result === "undefined" || balance.result === null ||
            Object.entries(balance.result).length === 0) {

            return { 
                "error" : [ ], 
                "result" : { 
                    "funds" : 0
                }
            };
        }        

        // Recuperem els fons
        let funds = 0;
        for (var i = 0; i < Object.entries(balance.result).length; i++) {
            let asset = Object.entries(balance.result)[i][0];
            // Comparem per detectar quan asset === currency, quan asset està dins de currency i quan currency està a dins de asset
            if (asset === currency || asset.includes(currency) || currency.includes(asset)) {
                funds = parseFloat(Object.entries(balance.result)[i][1]);
            }
        }

        return { 
            "error" : [ ], 
            "result" : {
                "funds" : funds
            }
        };
    }
    catch (err) {
        logger.error(err.message)
        return { 
            "error" : [ "Exception getting funds " + err.message ], 
            "result" : {
                "funds" : 0
            }
        };
    }
}
*/

/**
 * Funció per crear ordres de compra o venda
 * Veure https://www.kraken.com/features/api
 * @param {*} pair : crypto + moneda  Ex: 'XBTEUR'
 * @param {*} volume : volum que es vol comprar (es calcula amb els fons disponibles menys un 1% i dividit pel valor actual de la crypto)
 * @param {*} action : 'buy' / 'sell'
 * 
 * Retorna un objecte json amb l'estructura: { "error": [], "result": {}}
 */
exports.addOrder = async function (pair, volume, action) {
    try {
        // Compra de la cripto
        // Retorna una cosa del tipus:
        // Array ( [error] => Array ( )
        //         [result] => Array (
        //              [descr] => Array ( [order] => sell 1.12300000 XBTUSD @ limit 120.00000 )
        //              [txid] => Array ( [0] => OAVY7T-MV5VK-KHDF5X )
        //         )
        //    )
        var msg = await krakenAPI.api('AddOrder', {
                pair: pair,
                type: action,
                ordertype: 'market',
                volume: volume
            });
        //console.log(msg);
        return msg;
    } catch (err) {
        //console.log(err);
        return { "error" : [ err.message ], "result" : {} };
    }
}

/**
 * Funció que obté el valor d'una crypto
 * La crida a kraken és del tipus: https://api.kraken.com/0/public/Ticker?pair=XBTEUR
 * Veure https://www.kraken.com/features/api
 * @param {*} pair  : crypto + moneda  Ex: 'XBTEUR'
 * 
 * Retorna un JSON del tipus: { "error" : [], "result" : {} }
 */
exports.getTicker = async function (pair) {
    try {
        // Càlcul del volum de cripto que es vol comprar
        // Kraken retorna un objecte:
        //{
        //    "error": [],
        //    "result": {
        //        "XXBTZEUR": {
        //            a: [ '41193.40000', '1', '1.000' ],
        //            b: [ '41193.30000', '2', '2.000' ],
        //            c: [ '41194.30000', '0.10000000' ],
        //            v: [ '4019.56938193', '5793.50042560' ],
        //            p: [ '41371.13767', '41107.71138' ],
        //            t: [ 43719, 64168 ],
        //            l: [ '39912.00000', '39610.80000' ],
        //            h: [ '42515.10000', '42515.10000' ],
        //            o: '40907.50000'                  
        //        }
        //    }
        //}
        // Ens quedem amb result.XXBTZEUR.a[0] on a = ask array(<price>, <whole lot volume>, <lot volume>),
        // Nota: XXBTZEUR = X + crypto + Z + moneda
        var cryptoValue = await krakenAPI.api('Ticker', { pair: pair });
        //console.log("kraken Ticker = " + cryptoValue);
        //var volume = funds / parseFloat(cryptoValue.result[Object.keys(arr.result)[0]].a[0]);
        //console.log("volume = " + volume);
        //return volume;
        return cryptoValue;
    } catch (err) {
        console.log(err);
        return { "error" : [ err.message ] };
    }
}