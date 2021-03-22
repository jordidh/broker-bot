// $ mocha test/api/brokerIndexes.js 

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
//let chaiHttp = require('chai-http');
const should = chai.should();
const expect    = require("chai").expect;

const brokerControl = require('../../api/brokerControl');


describe('BrokerControl.applyIndicator()', () =>  {
    it('calculates SMA successfully', async () => {
        const prices = [
            [1, 168, 0, 0],
            [2, 170, 0, 0],
            [3, 171, 0, 0],
            [4, 175, 0, 0],
            [5, 170, 0, 0],
            [6, 172, 0, 0],
            [7, 176, 0, 0],
            [8, 179, 0, 0],
            [9, 178, 0, 0],
            [10, 186, 0, 0],
            [11, 192, 0, 0],
            [12, 183, 0, 0],
            [13, 177, 0, 0],
            [14, 172, 0, 0],
            [15, 167, 0, 0],
            [16, 177, 0, 0],
            [17, 180, 0, 0]
        ];

        var smaExpected = {
            "error" : [ ],
            "result" : [
                [1, 0],
                [2, 0],
                [3, 0],
                [4, 0],
                [5, 0],
                [6, 0],
                [7, 0],
                [8, 172.625000], 
                [9, 173.875000], 
                [10, 175.875000], 
                [11, 178.500000], 
                [12, 179.500000], 
                [13, 180.375000], 
                [14, 180.375000], 
                [15, 179.250000], 
                [16, 179.000000],
                [17, 179.250000]
            ]
        };

        let result = await brokerControl.applyIndicator(prices, "SMA", 8, 0, 1);

        expect(result).to.deep.equal(smaExpected);
    });

    it('calculates EMA successfully', async () => {
        const prices = [
            [1, 168, 0, 0],
            [2, 170, 0, 0],
            [3, 171, 0, 0],
            [4, 175, 0, 0],
            [5, 170, 0, 0],
            [6, 172, 0, 0],
            [7, 176, 0, 0],
            [8, 179, 0, 0],
            [9, 178, 0, 0],
            [10, 186, 0, 0],
            [11, 192, 0, 0],
            [12, 183, 0, 0],
            [13, 177, 0, 0],
            [14, 172, 0, 0],
            [15, 167, 0, 0],
            [16, 177, 0, 0],
            [17, 180, 0, 0]
        ];

        var emaExpected = {
            "error" : [ ],
            "result" : [
                [1, 0],
                [2, 0],
                [3, 0],
                [4, 0],
                [5, 0],
                [6, 0],
                [7, 0],
                [8, 173.43139585475046],
                [9, 174.44664122036147], 
                [10, 177.01405428250337], 
                [11, 180.34426444194708], 
                [12, 180.93442789929216], 
                [13, 180.06011058833835], 
                [14, 178.26897490204092], 
                [15, 175.76475825714294],
                [16, 176.0392564222223],
                [17, 176.91942166172845]
            ]
        };

        let result = await brokerControl.applyIndicator(prices, "EMA", 8, 0, 1);

        expect(result).to.deep.equal(emaExpected);
    });

    it('calculates DEMA successfully', async () => {
        const prices = [
            // time, price, 0, 0
            [1, 41394.07, 0, 0],
            [2, 41266.42, 0, 0],
            [3, 41151.8, 0, 0],
            [4, 41164.71, 0, 0],
            [5, 40937.27, 0, 0],
            [6, 40968.19, 0, 0],
            [7, 40843.89, 0, 0],
            [8, 40923.11, 0, 0],
            [9, 40838.22, 0, 0],
            [10, 40763.32, 0, 0],
            [11, 40749.72, 0, 0],
            [12, 41111.54, 0, 0],
            [13, 41051.5, 0, 0],
            [14, 40886.6, 0, 0],
            [15, 40632.58, 0, 0],
            [16, 40392.17, 0, 0],
            [17, 40494.23, 0, 0],
            [18, 40096.49, 0, 0],
            [19, 39865.73, 0, 0],
            [20, 40057.04, 0, 0],
        ];

        var demaExpected = {
            "error" : [ ],
            "result" : [
                [1, 0],
                [2, 0],
                [3, 0],
                [4, 0],
                [5, 0],
                [6, 0],
                [7, 0],
                [8, 0],
                [9, 0],
                [10, 40814.91311662806],
                [11, 40767.0991626708],
                [12, 40854.12687406567],
                [13, 40901.046685030306],
                [14, 40882.91708129489],
                [15, 40786.92893065234],
                [16, 40638.09557590312],
                [17, 40564.07240203288],
                [18, 40380.72656160626],
                [19, 40172.31036887087],
                [20, 40085.90017806881]
            ]
        };

        let result = await brokerControl.applyIndicator(prices, "DEMA", 10, 0, 1);
        
        expect(result).to.deep.equal(demaExpected);
    });
});

describe('BrokerControl.analizeStrategy()', () => {
    it('gives error if strategy is not defined', async () => {
        const analysisBatchNumber = "Proves-0001";
        const analysisId = 1;
        const funds = 1000;   // €
        const comission = [ 2, 4];  // comprar 2%, vendre 4%
        const market = {
            "id" : "BTC",
            "api" : "",  // pel test no es fa servir
            "strategy" : "",  // <----- no posem cap estratègia, ha de fallar
            "decisionWindow" : "",
            "indicator" : [
                { "name" : "DEMA", "period" : 10 },
                { "name" : "DEMA", "period" : 20 }
            ],
            "tradingBots" : [ ]  // pel test no es fa servir
        };
        const prices = [     // cada element ha de ser un array del tipus [ unixtime, obertura, màxim, mínim, tancament ]
            [1614791800, 0, 0, 0, 166],   // Dades inicials per omplir els DEMA. GMT: Wednesday 3 March 2021 17:16:40 
            [1614792800, 0, 0, 0, 166],   
            [1614793800, 0, 0, 0, 166],   
            [1614794800, 0, 0, 0, 166],   
            [1614795800, 0, 0, 0, 166],   
            [1614796800, 0, 0, 0, 166],   
            [1614797800, 0, 0, 0, 166],   
            [1614798800, 0, 0, 0, 166],   
            [1614799800, 0, 0, 0, 166],   
            [1614800800, 0, 0, 0, 166],   
            [1614801800, 0, 0, 0, 166],   
            [1614802800, 0, 0, 0, 166],   
            [1614803800, 0, 0, 0, 166],   
            [1614804800, 0, 0, 0, 166],   
            [1614805800, 0, 0, 0, 166],   
            [1614806800, 0, 0, 0, 166],   
            [1614807800, 0, 0, 0, 166],   
            [1614808800, 0, 0, 0, 166],   
            [1614809800, 0, 0, 0, 166],   
            [1614810800, 0, 0, 0, 166],   
            [1614811800, 0, 0, 0, 166],   // GMT: Wednesday 3 March 2021 22:50:00
            [1614812800, 0, 0, 0, 166],   // GMT: Wednesday 3 March 2021 23:06:40
            [1614813800, 0, 0, 0, 166]
        ];
        const expectedResult = {
            "error" : [ "strategy \"\" incorrect or not implemented" ],
            "result" : { }
        };

        let result = await brokerControl.analizeStrategy(analysisBatchNumber, analysisId, funds, comission, market, prices);

        //console.log(result);

        expect(result).to.deep.equal(expectedResult);
    });

    it('gives error if strategy is not defined', async () => {
        const analysisBatchNumber = "Proves-0001";
        const analysisId = 1;
        const funds = 1000;   // €
        const comission = [ 2, 4];  // comprar 2%, vendre 4%
        const market = {
            "id" : "BTC",
            "api" : "",  // pel test no es fa servir
            "strategy" : "NOT_DEFINED",  // <----- posem una estratègia que no existeix, ha de fallar
            "decisionWindow" : "",
            "indicator" : [
                { "name" : "DEMA", "period" : 10 },
                { "name" : "DEMA", "period" : 20 }
            ],
            "tradingBots" : [ ]  // pel test no es fa servir
        };
        const prices = [     // cada element ha de ser un array del tipus [ unixtime, obertura, màxim, mínim, tancament ]
            [1614791800, 0, 0, 0, 166],   // Dades inicials per omplir els DEMA. GMT: Wednesday 3 March 2021 17:16:40 
            [1614792800, 0, 0, 0, 166],   
            [1614793800, 0, 0, 0, 166],   
            [1614794800, 0, 0, 0, 166],   
            [1614795800, 0, 0, 0, 166],   
            [1614796800, 0, 0, 0, 166],   
            [1614797800, 0, 0, 0, 166],   
            [1614798800, 0, 0, 0, 166],   
            [1614799800, 0, 0, 0, 166],   
            [1614800800, 0, 0, 0, 166],   
            [1614801800, 0, 0, 0, 166],   
            [1614802800, 0, 0, 0, 166],   
            [1614803800, 0, 0, 0, 166],   
            [1614804800, 0, 0, 0, 166],   
            [1614805800, 0, 0, 0, 166],   
            [1614806800, 0, 0, 0, 166],   
            [1614807800, 0, 0, 0, 166],   
            [1614808800, 0, 0, 0, 166],   
            [1614809800, 0, 0, 0, 166],   
            [1614810800, 0, 0, 0, 166],   
            [1614811800, 0, 0, 0, 166],   // GMT: Wednesday 3 March 2021 22:50:00
            [1614812800, 0, 0, 0, 166],   // GMT: Wednesday 3 March 2021 23:06:40
            [1614813800, 0, 0, 0, 166]
        ];
        const expectedResult = {
            "error" : [ "strategy \"NOT_DEFINED\" incorrect or not implemented" ],
            "result" : { }
        };

        let result = await brokerControl.analizeStrategy(analysisBatchNumber, analysisId, funds, comission, market, prices);

        //console.log(result);

        expect(result).to.deep.equal(expectedResult);
    });

    it('gives error if strategy demax2 has a invalid indicators', async () => {
        const analysisBatchNumber = "Proves-0001";
        const analysisId = 1;
        const funds = 1000;   // €
        const comission = [ 2, 4];  // comprar 2%, vendre 4%
        const market = {
            "id" : "BTC",
            "api" : "",  // pel test no es fa servir
            "strategy" : "demax2",  // <----- posem una estratègia que necessita 2 indicadors DEMA
            "decisionWindow" : "",
            "indicator" : [
                { "name" : "DEMA", "period" : 20 },   //  <----- posem indicadors a l'inrevés, ha de donar error
                { "name" : "DEMA", "period" : 10 }
            ],
            "tradingBots" : [ ]  // pel test no es fa servir
        };
        const prices = [     // cada element ha de ser un array del tipus [ unixtime, obertura, màxim, mínim, tancament ]
            [1614791800, 0, 0, 0, 166],   // Dades inicials per omplir els DEMA. GMT: Wednesday 3 March 2021 17:16:40 
            [1614792800, 0, 0, 0, 166],   
            [1614793800, 0, 0, 0, 166],   
            [1614794800, 0, 0, 0, 166],   
            [1614795800, 0, 0, 0, 166],   
            [1614796800, 0, 0, 0, 166],   
            [1614797800, 0, 0, 0, 166],   
            [1614798800, 0, 0, 0, 166],   
            [1614799800, 0, 0, 0, 166],   
            [1614800800, 0, 0, 0, 166],   
            [1614801800, 0, 0, 0, 166],   
            [1614802800, 0, 0, 0, 166],   
            [1614803800, 0, 0, 0, 166],   
            [1614804800, 0, 0, 0, 166],   
            [1614805800, 0, 0, 0, 166],   
            [1614806800, 0, 0, 0, 166],   
            [1614807800, 0, 0, 0, 166],   
            [1614808800, 0, 0, 0, 166],   
            [1614809800, 0, 0, 0, 166],   
            [1614810800, 0, 0, 0, 166],   
            [1614811800, 0, 0, 0, 166],   // GMT: Wednesday 3 March 2021 22:50:00
            [1614812800, 0, 0, 0, 166],   // GMT: Wednesday 3 March 2021 23:06:40
            [1614813800, 0, 0, 0, 166]
        ];
        const expectedResult = {
            "error" : [ "indicators incorrect, strategy demax2 must have 2, with the same name and the period of the 2n must be grater than the first" ],
            "result" : { }
        };

        let result = await brokerControl.analizeStrategy(analysisBatchNumber, analysisId, funds, comission, market, prices);

        //console.log(result);

        expect(result).to.deep.equal(expectedResult);
    });

    it('calculates one buy and one sell with strategy demax2 and -48€ of profit', async () => {
        const analysisBatchNumber = "Proves-0001";
        const analysisId = 1;
        const funds = 1000;   // €
        const comission = [ 2, 4];  // comprar 2%, vendre 4%
        const market = {
            "id" : "BTC",
            "api" : "",  // pel test no es fa servir
            "strategy" : "demax2",
            "decisionWindow" : "",
            "indicator" : [
                { "name" : "DEMA", "period" : 10 },
                { "name" : "DEMA", "period" : 20 }
            ],
            "tradingBots" : [ ]  // pel test no es fa servir
        };
        const prices = [     // cada element ha de ser un array del tipus [ unixtime, obertura, màxim, mínim, tancament ]
            [1614791800, 0, 0, 0, 166],   // Dades inicials per omplir els DEMA. GMT: Wednesday 3 March 2021 17:16:40 
            [1614792800, 0, 0, 0, 166],   
            [1614793800, 0, 0, 0, 166],   
            [1614794800, 0, 0, 0, 166],   
            [1614795800, 0, 0, 0, 166],   
            [1614796800, 0, 0, 0, 166],   
            [1614797800, 0, 0, 0, 166],   
            [1614798800, 0, 0, 0, 166],   
            [1614799800, 0, 0, 0, 166],   
            [1614800800, 0, 0, 0, 166],   
            [1614801800, 0, 0, 0, 166],   
            [1614802800, 0, 0, 0, 166],   
            [1614803800, 0, 0, 0, 166],   
            [1614804800, 0, 0, 0, 166],   
            [1614805800, 0, 0, 0, 166],   
            [1614806800, 0, 0, 0, 166],   
            [1614807800, 0, 0, 0, 166],   
            [1614808800, 0, 0, 0, 166],   
            [1614809800, 0, 0, 0, 166],   
            [1614810800, 0, 0, 0, 166],   
            [1614811800, 0, 0, 0, 166],   // GMT: Wednesday 3 March 2021 22:50:00
            [1614812800, 0, 0, 0, 166],   // GMT: Wednesday 3 March 2021 23:06:40
            [1614813800, 0, 0, 0, 166],
            [1614814800, 0, 0, 0, 166],
            [1614815800, 0, 0, 0, 168],   // Comença a pujar => Aquí ens adonarem que s'han creuat els DEMA i comprarem
            [1614816800, 0, 0, 0, 170],
            [1614817800, 0, 0, 0, 172],
            [1614818800, 0, 0, 0, 174],
            [1614819800, 0, 0, 0, 176],
            [1614820800, 0, 0, 0, 178],
            [1614821800, 0, 0, 0, 180],
            [1614822800, 0, 0, 0, 183],
            [1614823800, 0, 0, 0, 187],
            [1614824800, 0, 0, 0, 192],
            [1614825800, 0, 0, 0, 190],
            [1614826800, 0, 0, 0, 187],   // Comença a baixar => vendre
            [1614827800, 0, 0, 0, 180],
            [1614828800, 0, 0, 0, 170],   // <--- Aquí ens adonarem que s'han creuat els DEMA i vendrem
            [1614829800, 0, 0, 0, 160]    // GMT: Thursday 4 March 2021 3:50:
        ];
        const expectedResult = {
            "error" : [],
            "result" : {
                "data" : [
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":166},{"name":"DEMA","period":20,"value":166}],"market":"BTC","price":166,"volume":0,"buyPrice":0,"windowEnd":1614811800,"windowStart":0},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":166},{"name":"DEMA","period":20,"value":166}],"market":"BTC","price":166,"volume":0,"buyPrice":0,"windowEnd":1614812800,"windowStart":1614811800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":166},{"name":"DEMA","period":20,"value":166}],"market":"BTC","price":166,"volume":0,"buyPrice":0,"windowEnd":1614813800,"windowStart":1614812800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":166},{"name":"DEMA","period":20,"value":166}],"market":"BTC","price":166,"volume":0,"buyPrice":0,"windowEnd":1614814800,"windowStart":1614813800},
                    {"decision":"buy","indicatorValues":[{"name":"DEMA","period":10,"value":166.6611570247934},{"name":"DEMA","period":20,"value":166.36281179138322}],"market":"BTC","price":168,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614815800,"windowStart":1614814800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":167.809166040571},{"name":"DEMA","period":20,"value":167.03746895583632}],"market":"BTC","price":170,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614816800,"windowStart":1614815800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":169.31124923160985},{"name":"DEMA","period":20,"value":167.97942215434927}],"market":"BTC","price":172,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614817800,"windowStart":1614816800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":171.0668173435744},{"name":"DEMA","period":20,"value":169.14977910683405}],"market":"BTC","price":174,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614818800,"windowStart":1614817800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":173.0001541013829},{"name":"DEMA","period":20,"value":170.51463113272897}],"market":"BTC","price":176,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614819800,"windowStart":1614818800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":175.05469675408503},{"name":"DEMA","period":20,"value":172.04445665839145}],"market":"BTC","price":178,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614820800,"windowStart":1614819800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":177.1885741743539},{"name":"DEMA","period":20,"value":173.7135931394132}],"market":"BTC","price":180,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614821800,"windowStart":1614820800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":179.70171280529902},{"name":"DEMA","period":20,"value":175.68117567249982}],"market":"BTC","price":183,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614822800,"windowStart":1614821800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":182.81541014319458},{"name":"DEMA","period":20,"value":178.08383461071813}],"market":"BTC","price":187,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614823800,"windowStart":1614822800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":186.69101215804383},{"name":"DEMA","period":20,"value":181.03853877909438}],"market":"BTC","price":192,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614824800,"windowStart":1614823800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":188.7997701297018},{"name":"DEMA","period":20,"value":183.19385408446277}],"market":"BTC","price":190,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614825800,"windowStart":1614824800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":189.25935951140005},{"name":"DEMA","period":20,"value":184.47569854908892}],"market":"BTC","price":187,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614826800,"windowStart":1614825800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":187.17827936158153},{"name":"DEMA","period":20,"value":184.27806375891586}],"market":"BTC","price":180,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614827800,"windowStart":1614826800},
                    {"decision":"sell","indicatorValues":[{"name":"DEMA","period":10,"value":182.2420759766094},{"name":"DEMA","period":20,"value":182.2634188285573}],"market":"BTC","price":170,"volume":0,"buyPrice":0,"windowEnd":1614828800,"windowStart":1614827800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":175.22719351306247},{"name":"DEMA","period":20,"value":178.68895058553306}],"market":"BTC","price":160,"volume":0,"buyPrice":0,"windowEnd":1614829800,"windowStart":1614828800}
                ],
                "fundsBegin" : 1000,
                "fundsEnd" : 952,
                "comission" : 59.666666666666664,
                "profit" : -48,
                "analysisBatchNumber" : analysisBatchNumber,
                "analysisId" : analysisId
            } 
        };

        let result = await brokerControl.analizeStrategy(analysisBatchNumber, analysisId, funds, comission, market, prices);

        //console.log(result);

        expect(result).to.deep.equal(expectedResult);
    });

    it('calculates two buy and two sell with strategy demax2 and +13€ of profit', async () => {
        const analysisBatchNumber = "Proves-0001";
        const analysisId = 2;
        const funds = 1000;   // €
        const comission = [ 2, 4];  // comprar 2%, vendre 4%
        const market = {
            "id" : "BTC",
            "api" : "",  // pel test no es fa servir
            "strategy" : "demax2",
            "decisionWindow" : "",
            "indicator" : [
                { "name" : "DEMA", "period" : 10 },
                { "name" : "DEMA", "period" : 20 }
            ],
            "tradingBots" : [ ]  // pel test no es fa servir
        };
        const prices = [     // cada element ha de ser un array del tipus [ unixtime, obertura, màxim, mínim, tancament ]
            [1614791800, 0, 0, 0, 166],   // Dades inicials per omplir els DEMA. GMT: Wednesday 3 March 2021 17:16:40 
            [1614792800, 0, 0, 0, 166],   
            [1614793800, 0, 0, 0, 166],   
            [1614794800, 0, 0, 0, 166],   
            [1614795800, 0, 0, 0, 166],   
            [1614796800, 0, 0, 0, 166],   
            [1614797800, 0, 0, 0, 166],   
            [1614798800, 0, 0, 0, 166],   
            [1614799800, 0, 0, 0, 166],   
            [1614800800, 0, 0, 0, 166],   
            [1614801800, 0, 0, 0, 166],   
            [1614802800, 0, 0, 0, 166],   
            [1614803800, 0, 0, 0, 166],   
            [1614804800, 0, 0, 0, 166],   
            [1614805800, 0, 0, 0, 166],   
            [1614806800, 0, 0, 0, 166],   
            [1614807800, 0, 0, 0, 166],   
            [1614808800, 0, 0, 0, 166],   
            [1614809800, 0, 0, 0, 166],   
            [1614810800, 0, 0, 0, 166],   
            [1614811800, 0, 0, 0, 166],   // GMT: Wednesday 3 March 2021 22:50:00
            [1614812800, 0, 0, 0, 166],   // GMT: Wednesday 3 March 2021 23:06:40
            [1614813800, 0, 0, 0, 166],
            [1614814800, 0, 0, 0, 166],
            [1614815800, 0, 0, 0, 168],   // Comença a pujar => Aquí ens adonarem que s'han creuat els DEMA i comprarem
            [1614816800, 0, 0, 0, 170],
            [1614817800, 0, 0, 0, 172],
            [1614818800, 0, 0, 0, 174],
            [1614819800, 0, 0, 0, 176],
            [1614820800, 0, 0, 0, 178],
            [1614821800, 0, 0, 0, 180],
            [1614822800, 0, 0, 0, 183],
            [1614823800, 0, 0, 0, 187],
            [1614824800, 0, 0, 0, 192],
            [1614825800, 0, 0, 0, 190],
            [1614826800, 0, 0, 0, 187],   // Comença a baixar => vendre
            [1614827800, 0, 0, 0, 180],
            [1614828800, 0, 0, 0, 170],   // <--- Aquí ens adonarem que s'han creuat els DEMA i vendrem
            [1614829800, 0, 0, 0, 160],   // GMT: Thursday 4 March 2021 3:50:
            [1614830800, 0, 0, 0, 190],   // <--- tornema pujar i a comprar
            [1614831800, 0, 0, 0, 270],   // <--- comprem
            [1614832800, 0, 0, 0, 320],
            [1614833800, 0, 0, 0, 470],
            [1614834800, 0, 0, 0, 460],   // <--- comencem a baixar
            [1614835800, 0, 0, 0, 450],   
            [1614836800, 0, 0, 0, 440],
            [1614837800, 0, 0, 0, 400],
            [1614838800, 0, 0, 0, 370],
            [1614839800, 0, 0, 0, 350],
            [1614840800, 0, 0, 0, 330],
            [1614841800, 0, 0, 0, 320]    // <--- venem
        ];
        const expectedResult = {
            "error" : [],
            "result" : {
                "data" : [
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":166},{"name":"DEMA","period":20,"value":166}],"market":"BTC","price":166,"volume":0,"buyPrice":0,"windowEnd":1614811800,"windowStart":0},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":166},{"name":"DEMA","period":20,"value":166}],"market":"BTC","price":166,"volume":0,"buyPrice":0,"windowEnd":1614812800,"windowStart":1614811800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":166},{"name":"DEMA","period":20,"value":166}],"market":"BTC","price":166,"volume":0,"buyPrice":0,"windowEnd":1614813800,"windowStart":1614812800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":166},{"name":"DEMA","period":20,"value":166}],"market":"BTC","price":166,"volume":0,"buyPrice":0,"windowEnd":1614814800,"windowStart":1614813800},
                    {"decision":"buy","indicatorValues":[{"name":"DEMA","period":10,"value":166.6611570247934},{"name":"DEMA","period":20,"value":166.36281179138322}],"market":"BTC","price":168,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614815800,"windowStart":1614814800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":167.809166040571},{"name":"DEMA","period":20,"value":167.03746895583632}],"market":"BTC","price":170,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614816800,"windowStart":1614815800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":169.31124923160985},{"name":"DEMA","period":20,"value":167.97942215434927}],"market":"BTC","price":172,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614817800,"windowStart":1614816800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":171.0668173435744},{"name":"DEMA","period":20,"value":169.14977910683405}],"market":"BTC","price":174,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614818800,"windowStart":1614817800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":173.0001541013829},{"name":"DEMA","period":20,"value":170.51463113272897}],"market":"BTC","price":176,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614819800,"windowStart":1614818800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":175.05469675408503},{"name":"DEMA","period":20,"value":172.04445665839145}],"market":"BTC","price":178,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614820800,"windowStart":1614819800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":177.1885741743539},{"name":"DEMA","period":20,"value":173.7135931394132}],"market":"BTC","price":180,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614821800,"windowStart":1614820800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":179.70171280529902},{"name":"DEMA","period":20,"value":175.68117567249982}],"market":"BTC","price":183,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614822800,"windowStart":1614821800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":182.81541014319458},{"name":"DEMA","period":20,"value":178.08383461071813}],"market":"BTC","price":187,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614823800,"windowStart":1614822800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":186.69101215804383},{"name":"DEMA","period":20,"value":181.03853877909438}],"market":"BTC","price":192,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614824800,"windowStart":1614823800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":188.7997701297018},{"name":"DEMA","period":20,"value":183.19385408446277}],"market":"BTC","price":190,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614825800,"windowStart":1614824800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":189.25935951140005},{"name":"DEMA","period":20,"value":184.47569854908892}],"market":"BTC","price":187,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614826800,"windowStart":1614825800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":187.17827936158153},{"name":"DEMA","period":20,"value":184.27806375891586}],"market":"BTC","price":180,"volume":5.833333333333333,"buyPrice":980,"windowEnd":1614827800,"windowStart":1614826800},
                    {"decision":"sell","indicatorValues":[{"name":"DEMA","period":10,"value":182.2420759766094},{"name":"DEMA","period":20,"value":182.2634188285573}],"market":"BTC","price":170,"volume":0,"buyPrice":0,"windowEnd":1614828800,"windowStart":1614827800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":175.22719351306247},{"name":"DEMA","period":20,"value":178.68895058553306}],"market":"BTC","price":160,"volume":0,"buyPrice":0,"windowEnd":1614829800,"windowStart":1614828800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":179.94525753290088},{"name":"DEMA","period":20,"value":181.03557453547896}],"market":"BTC","price":190,"volume":0,"buyPrice":0,"windowEnd":1614830800,"windowStart":1614829800},
                    {"decision":"buy","indicatorValues":[{"name":"DEMA","period":10,"value":209.88230014013484},{"name":"DEMA","period":20,"value":197.5502887027999}],"market":"BTC","price":270,"volume":3.4554074074074075,"buyPrice":932.96,"windowEnd":1614831800,"windowStart":1614830800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":248.43908733538615},{"name":"DEMA","period":20,"value":220.79657137761095}],"market":"BTC","price":320,"volume":3.4554074074074075,"buyPrice":932.96,"windowEnd":1614832800,"windowStart":1614831800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":326.2022560417813},{"name":"DEMA","period":20,"value":267.9365300172852}],"market":"BTC","price":470,"volume":3.4554074074074075,"buyPrice":932.96,"windowEnd":1614833800,"windowStart":1614832800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":379.7064514223671},{"name":"DEMA","period":20,"value":306.54373851808623}],"market":"BTC","price":460,"volume":3.4554074074074075,"buyPrice":932.96,"windowEnd":1614834800,"windowStart":1614833800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":414.87185654747435},{"name":"DEMA","period":20,"value":337.72520635191125}],"market":"BTC","price":450,"volume":3.4554074074074075,"buyPrice":932.96,"windowEnd":1614835800,"windowStart":1614834800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":436.267810175109},{"name":"DEMA","period":20,"value":362.45447860271213}],"market":"BTC","price":440,"volume":3.4554074074074075,"buyPrice":932.96,"windowEnd":1614836800,"windowStart":1614835800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":437.4909589613732},{"name":"DEMA","period":20,"value":376.14483998168777}],"market":"BTC","price":400,"volume":3.4554074074074075,"buyPrice":932.96,"windowEnd":1614837800,"windowStart":1614836800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":427.1530351253559},{"name":"DEMA","period":20,"value":382.1258855551197}],"market":"BTC","price":370,"volume":3.4554074074074075,"buyPrice":932.96,"windowEnd":1614838800,"windowStart":1614837800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":411.73167999131607},{"name":"DEMA","period":20,"value":383.2838309287896}],"market":"BTC","price":350,"volume":3.4554074074074075,"buyPrice":932.96,"windowEnd":1614839800,"windowStart":1614838800},
                    {"decision":"relax","indicatorValues":[{"name":"DEMA","period":10,"value":392.75600655476654},{"name":"DEMA","period":20,"value":380.3017061128705}],"market":"BTC","price":330,"volume":3.4554074074074075,"buyPrice":932.96,"windowEnd":1614840800,"windowStart":1614839800},
                    {"decision":"sell","indicatorValues":[{"name":"DEMA","period":10,"value":374.6729191615469},{"name":"DEMA","period":20,"value":375.59024606072023}],"market":"BTC","price":320,"volume":0,"buyPrice":0,"windowEnd":1614841800,"windowStart":1614840800}
                ],
                "fundsBegin" : 1000,
                "fundsEnd" : 1061.5011555555554,
                "comission" : 122.93588148148147,
                "profit" : 13.501155555555442,
                "analysisBatchNumber" : analysisBatchNumber,
                "analysisId" : analysisId
            } 
        };

        let result = await brokerControl.analizeStrategy(analysisBatchNumber, analysisId, funds, comission, market, prices);

        //console.log(result);

        expect(result).to.deep.equal(expectedResult);
    });
});
