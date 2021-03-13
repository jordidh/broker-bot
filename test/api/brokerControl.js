// $ mocha test/api/brokerIndexes.js 

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
//let chaiHttp = require('chai-http');
const should = chai.should();
const expect    = require("chai").expect;

const brokerControl = require('../../api/brokerControl');


describe('Broker Indexes, SimpleMovingAverage', () =>  {
    it('calculates SMA successfully', async () => {
        let prices = [
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

        var result = await brokerControl.applyIndicator(prices, "SMA", 8, 0, 1);

        expect(result).to.deep.equal(smaExpected);
    });
});

describe('Broker Indexes, ExponentialMovingAverage', () =>  {
    it('calculates EMA successfully', async () => {
        let prices = [
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

        var result = await brokerControl.applyIndicator(prices, "EMA", 8, 0, 1);

        expect(result).to.deep.equal(emaExpected);
    });
});

describe('Broker Indexes, DoubleExponentialMovingAverage', () =>  {
    it('calculates DEMA successfully', async () => {
        let prices = [
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

        var result = await brokerControl.applyIndicator(prices, "DEMA", 10, 0, 1);
        
        expect(result).to.deep.equal(demaExpected);
    });
});
