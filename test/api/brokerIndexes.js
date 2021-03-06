// $ mocha test/api/brokerIndexes.js 

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
//let chaiHttp = require('chai-http');
let should = chai.should();
let expect    = require("chai").expect;

let brokerIndexes = require('../../api/brokerIndexes');

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

describe('Broker Indexes, DoubleExponentialMovingAverage', () =>  {
    it('calculates DEMA successfully', async () => {
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

        var demaExpected = {
            "error" : [ ],
            "result" : [
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

        var result = await brokerIndexes.DoubleExponentialMovingAverage(prices, 0, 1, 8);
        expect(result).to.deep.equal(demaExpected);
    });
});