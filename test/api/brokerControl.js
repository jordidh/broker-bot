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
    it('calculates one buy and one sell with 10€ of profit', async () => {
        const analysisBatchNumber = "Proves-0001";
        const analysisId = 1;
        const funds = 1000;   // €
        const comission = [ 2, 4];  // comprar 2%, vendre 4%
        const market = {
            "id" : "BTC",
            "api" : "",  // pel test no es fa servir
            "strategy" : "",
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
            [1614815800, 0, 0, 0, 168],   // Comença a pujar => comprar
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
            [1614828800, 0, 0, 0, 170],
            [1614829800, 0, 0, 0, 160]    // GMT: Thursday 4 March 2021 3:50:
        ];

        let result = await brokerControl.analizeStrategy(analysisBatchNumber, analysisId, funds, comission, market, prices);

        console.log(result);
    });
});
