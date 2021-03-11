# broker-bot
broker: a person who buys and sells goods or assets for others. 

Aquest bot analitza el mercat i dona l'ordre de compra al trading-bot a partir d'unes estratègies configurades.

# Arquitectura
broker-bot --[POST]buy/sell--> trading-bot --[POST]buy/sell--> exchange

# Funcionalitat
Periòdicament farà:
1. Recuperarà tot l'històric d'una o diverses currency de l'exchange kraken
2. Aplicarà càlculs per saber si s'ha d'enviar una ordre de compra/venda o no
3. Determinarà a quí s'ha d'enviar l'ordre i l'enviarà

# Obtenció de dades de mercats amb l'api pública de kraken
Obtener datos OHLC (Apertura, Máximo, Mínimo, Cierre)
URL: https://api.kraken.com/0/public/OHLC

Entrada:
pair = par de activos para obtener datos OHLC para el 
interval = intervalo de tiempo en minutos (opcional):
1 (por defecto), 5, 15, 30, 60, 240, 1440, 10080, 21600
since = devuelve datos OHLC comprometidos desde la identificación dada (opcional. exclusivo)

Resultado: vector de nombre de par y datos OHLC
<pair_name> = nombre del par
vector de entradas formadas(<hora> (en format unixtime), <apertura>, <máximo>, <mínimo>, <cierre>, <vwap>, <volumen>, <count>)
Nota: unixtime = seconds since jan 01 1970 UTC
last = identificación (id) para ser utilizado como desde cuando se sondeaban datos OHLC nuevos y comprometidos
Nota: la última entrada en el vector OHLC es para el intervalo actual, aun no comprometido y siempre estará presente, independientemente del valor de "since".

```
https://api.kraken.com/0/public/OHLC?pair=BTCEUR   // retorna les 12h últimes a intervals de 1 minuts
{
    error: [ ],
    result: {
        XXBTZEUR: [
            [
                1614933060, // 2021/03/05 08:31:00 +0000  (ara són les 2021/03/05 20:29:00 +0000)
                "39326.2",
                "39326.2",
                "39279.7",
                "39313.9",
                "39320.3",
                "4.88234043",
                38
            ],
            [ ... ]
        ],
        last: 1614976140 // 2021/03/05 20:29:00 +0000
    }
}

https://api.kraken.com/0/public/OHLC?pair=BTCEUR&interval=5   // retorna les 48h últimes a intervals de 5 minuts
https://api.kraken.com/0/public/OHLC?pair=BTCEUR&interval=60   // retorna l'últim mes a intervals de 60 minuts
https://api.kraken.com/0/public/OHLC?pair=BTCEUR&interval=1440   // retorna els últims 2 anys a intervals de 1440 minuts (24 hores)
```

# Configuració
El fitxer de configuració ha de tenir la següent estructura:
```
{
    "APP_PORT_HTTP": "4300",
    "jobs" : {
        "checkMarkets": {   
            "name": "checkMarkets",
            "schedule": "0 * * * * *",  // Cada minut al segon 0
            "markets": [
                {
                    "id" : "",              // Identificador del mercat que s'analitzarà per generar ordres de compra i venda
                    "api" : "",             // URL que es farà servir per obtenir les dades, p.e. https://api.kraken.com/0/public/OHLC?pair=BTCEUR&interval=5
                    "strategy" : "",        // Mètode JS que aplicarà els indicadors i decidirà si comprar o vendre
                    "decision-window" : "", // Finestra de decisió que s'aplicarà: és el temps sobre el que es mesuraràn els idicadors, hauria de correspondre a la planificació d'execució d'aquest job
                    "trading-bots" : [      // Bots de trading a que s'enviarà un POST per comprar o vendre
                        {
                            "url" : "",     // URL per accedir amb un POST al trading-bot
                            "token" : "",   // Token del bot
                            "pair" : ""     // pair que s'executarà, per anar bé hauria de ser el mateix que el de les dades que es recuperen a la api
                        }
                    ]
                },
                    /*
                    Obtener datos OHLC (Apertura, Máximo, Mínimo, Cierre)
                    URL: https://api.kraken.com/0/public/OHLC

                    Entrada:
                    pair = par de activos para obtener datos OHLC para el 
                    interval = intervalo de tiempo en minutos (opcional):
                    1 (por defecto), 5, 15, 30, 60, 240, 1440, 10080, 21600
                    since = devuelve datos OHLC comprometidos desde la identificación dada (opcional. exclusivo)

                    Resultado: vector de nombre de par y datos OHLC
                    <pair_name> = nombre del par
                    vector de entradas formadas(<hora> (en format unixtime), <apertura>, <máximo>, <mínimo>, <cierre>, <vwap>, <volumen>, <count>)
                    Nota: unixtime = seconds since jan 01 1970 UTC
                    last = identificación (id) para ser utilizado como desde cuando se sondeaban datos OHLC nuevos y comprometidos
                    Nota: la última entrada en el vector OHLC es para el intervalo actual, aun no comprometido y siempre estará presente, independientemente del valor de "since".

                    https://api.kraken.com/0/public/OHLC?pair=BTCEUR   // retorna les 12h últimes a intervals de 1 minuts
                    {
                        error: [ ],
                        result: {
                            XXBTZEUR: [
                                [
                                    1614933060, // 2021/03/05 08:31:00 +0000  (ara són les 2021/03/05 20:29:00 +0000)
                                    "39326.2",
                                    "39326.2",
                                    "39279.7",
                                    "39313.9",
                                    "39320.3",
                                    "4.88234043",
                                    38
                                ],
                                [ ... ]
                            ],
                            last: 1614976140 // 2021/03/05 20:29:00 +0000
                        }
                    }

                    https://api.kraken.com/0/public/OHLC?pair=BTCEUR&interval=5   // retorna les 48h últimes a intervals de 5 minuts
                    https://api.kraken.com/0/public/OHLC?pair=BTCEUR&interval=60   // retorna l'últim mes a intervals de 60 minuts
                    https://api.kraken.com/0/public/OHLC?pair=BTCEUR&interval=1440   // retorna els últims 2 anys a intervals de 1440 minuts (24 hores)
                    */
            ]
        }
    },
    // Vistes simultànies que es mostraran a la web dashboard
    "dashboard" : {
        "views" : [
            { "symbol" : "KRAKEN:XBTEUR", "interval" : "D" },
            { "symbol" : "KRAKEN:ETHEUR", "interval" : "D" },
            { "symbol" : "KRAKEN:ADAEUR", "interval" : "D" },
            { "symbol" : "KRAKEN:LTCEUR", "interval" : "D" },
            { "symbol" : "BITTREX:NEOBTC", "interval" : "D" },
            { "symbol" : "BITTREX:PAYBTC", "interval" : "D" }
        ]
    }
}
```