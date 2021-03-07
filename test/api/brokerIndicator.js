// $ mocha test/api/brokerIndexes.js 

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
//let chaiHttp = require('chai-http');
let should = chai.should();
let expect    = require("chai").expect;

let brokerIndexes = require('../../api/brokerIndicator');

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
                [8, 0],
                [9, 172.625], 
                [10, 173.875], 
                [11, 175.875], 
                [12, 178.5], 
                [13, 179.5], 
                [14, 180.375], 
                [15, 180.375], 
                [16, 179.25], 
                [17, 179]
            ]
        };

        var result = await brokerIndexes.SimpleMovingAverage(prices, 0, 1, 8);

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
                [8, 0],
                [9, 172.625], 
                [10, 175.59722222222223], 
                [11, 179.2422839506173], 
                [12, 180.07733196159123], 
                [13, 179.39348041457094], 
                [14, 177.75048476688852], 
                [15, 175.3614881520244], 
                [16, 175.725601896019],
                [17, 176.6754681413481]
            ]
        };

        var result = await brokerIndexes.ExponentialMovingAverage(prices, 0, 1, 8);

        expect(result).to.deep.equal(emaExpected);
    });
});

/*
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
                // time, dema 2
                [1, 0],
                [2, 0],
                [3, 0],
                [4, 0],
                [5, 0],
                [6, 0],
                [7, 0],
                [8, 0],
                [9, 0],
                [10, 0],
                [11, 40925.41],
                [12, 41003.43],
                [13, 41039.39],
                [14, 41009.35],
                [15, 40901.21],
                [16, 40740.46],
                [17, 40655.08],
                [18, 40461.12],
                [19, 40242.94],
                [20, 40147.66],
            ]
        };

        var result = await brokerIndexes.DoubleExponentialMovingAverage(prices, 0, 1, 10);

        expect(result).to.deep.equal(demaExpected);
    });
});
*/