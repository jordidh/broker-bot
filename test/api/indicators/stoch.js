// $ mocha test/api/indicators/stoch.js 

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
//let chaiHttp = require('chai-http');
const should = chai.should();
const expect    = require("chai").expect;

const Stoch = require('../../../api/indicators/stoch.js');


describe('Stoch indicator', () =>  {
    /*
    it('calculates K successfully with values as array of objects', async () => {
        const period = 14;

        const prices = [
            {"high":168, "low":161, "close":165},
            {"high":169, "low":165, "close":168},
            {"high":170, "low":162, "close":169},
            {"high":173, "low":164, "close":170},
            {"high":178, "low":170, "close":175},
            {"high":185, "low":180, "close":185},
            {"high":191, "low":185, "close":190},
            {"high":193, "low":185, "close":192},
            {"high":192, "low":182, "close":184},
            {"high":180, "low":177, "close":178},
            {"high":179, "low":170, "close":172},
            {"high":180, "low":172, "close":174},
            {"high":181, "low":176, "close":178},
            {"high":182, "low":177, "close":181},
            {"high":180, "low":178, "close":180},
            {"high":175, "low":164, "close":170},
            {"high":182, "low":169, "close":170},
            {"high":183, "low":173, "close":178},
            {"high":185, "low":175, "close":179},
            {"high":180, "low":178, "close":180}
        ];

        var resultExpected = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 62.5, 
            58.06451612903226, 25.806451612903224, 20.689655172413794, 48.275862068965516, 51.724137931034484, 55.172413793103445 ];

        let indicator = new Stoch(period);
        let result = [];
        for (let i = 0; i < prices.length; i++) {
            indicator.update(prices[i]);

            //console.log("s.isStable=" + indicator.isStable);

            if (i < (period -1)) {
                expect(indicator.isStable).to.equal(false);
            } else {
                expect(indicator.isStable).to.equal(true);
            }

            result.push(indicator.getResult());
        }

        expect(result).to.deep.equal(resultExpected);
    });

    it('calculates K successfully with values as array of arrays', async () => {
        const period = 14;

        const prices = [
            [168, 161, 165],
            [169, 165, 168],
            [170, 162, 169],
            [173, 164, 170],
            [178, 170, 175],
            [185, 180, 185],
            [191, 185, 190],
            [193, 185, 192],
            [192, 182, 184],
            [180, 177, 178],
            [179, 170, 172],
            [180, 172, 174],
            [181, 176, 178],
            [182, 177, 181],
            [180, 178, 180],
            [175, 164, 170],
            [182, 169, 170],
            [183, 173, 178],
            [185, 175, 179],
            [180, 178, 180]
        ];

        var resultExpected = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 62.5, 
            58.06451612903226, 25.806451612903224, 20.689655172413794, 48.275862068965516, 51.724137931034484, 55.172413793103445 ];

        let indicator = new Stoch(period);
        let result = [];
        for (let i = 0; i < prices.length; i++) {
            indicator.update(prices[i]);

            //console.log("s.isStable=" + indicator.isStable);

            if (i < (period -1)) {
                expect(indicator.isStable).to.equal(false);
            } else {
                expect(indicator.isStable).to.equal(true);
            }

            result.push(indicator.getResult());
        }

        expect(result).to.deep.equal(resultExpected);
    });
    */

    /*
    // Data from: XBTEUR, 7/4/2021 20:00
    high,    low,     close,   stoch %K(14)
    47455.0, 47057.4, 47455.0, 18.59   
    47586.7, 47374.7, 47461.6, 26.00
    47649.0, 47374.0, 47622.0, 33.29
    47689.0, 47190.7, 47233.5, 31.55
    47700.0, 47059.4, 47660.8, 41.92
    47817.4, 47530.6, 47717.3, 56.28
    47729.5, 47500.1, 47692.8, 76.15
    47804.1, 47519.9, 47755.7, 85.03
    48100.0, 47732.7, 48023.2, 88.12
    48142.0, 47951.2, 47994.0, 90.23
    48281.9, 47999.9, 48193.8, 92.07
    48336.3, 48092.1, 48137.0, 89.64
    48308.2, 47930.0, 48002.4, 85.97
    48100.0, 47811.0, 47828.9, 74.80
    47978.1, 47658.0, 47925.3, 68.55
    47962.1, 47532.0, 47606.0, 56.98
    48455.9, 47545.5, 48386.0, 68.54
    48568.8, 48239.1, 48344.7, 74.32
    48685.4, 48290.8, 48561.4, 89.90
    48671.9, 48431.5, 48575.4, 88.47
    48718.9, 48440.0, 48500.0, 87.33
    48553.2, 48387.8, 48491.0, 84.42
    48832.0, 48490.9, 48689.6, 83.86
    48752.7, 48487.2, 48543.7, 82.56
    */
    it('calculates K successfully with values as array of arrays with tradingview real data', async () => {
        const period = 14;

        const prices = [
            // XBTEUR, 7/4/2021 20:00
            [47455.0, 47057.4, 47455.0], 
            [47586.7, 47374.7, 47461.6], 
            [47649.0, 47374.0, 47622.0],
            [47689.0, 47190.7, 47233.5],
            [47700.0, 47059.4, 47660.8],
            [47817.4, 47530.6, 47717.3],
            [47729.5, 47500.1, 47692.8],
            [47804.1, 47519.9, 47755.7],
            [48100.0, 47732.7, 48023.2],
            [48142.0, 47951.2, 47994.0],
            [48281.9, 47999.9, 48193.8],
            [48336.3, 48092.1, 48137.0],
            [48308.2, 47930.0, 48002.4],
            [48100.0, 47811.0, 47828.9], 
            [47978.1, 47658.0, 47925.3], 
            [47962.1, 47532.0, 47606.0], 
            [48455.9, 47545.5, 48386.0], 
            [48568.8, 48239.1, 48344.7], 
            [48685.4, 48290.8, 48561.4], 
            [48671.9, 48431.5, 48575.4], 
            [48718.9, 48440.0, 48500.0], 
            [48553.2, 48387.8, 48491.0], 
            [48832.0, 48490.9, 48689.6], 
            [48752.7, 48487.2, 48543.7], 
        ];

        var resultExpected = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 68.54, 74.32, 89.90, 88.47, 87.33, 84.42, 83.86, 82.56];

        let indicator = new Stoch(period);
        let result = [];
        for (let i = 0; i < prices.length; i++) {
            indicator.update(prices[i]);

            //console.log("s.isStable=" + indicator.isStable);

            if (i < (period - 1 + 3)) {
                expect(indicator.isStable).to.equal(false);
            } else {
                expect(indicator.isStable).to.equal(true);
            }

            result.push(indicator.getResult());
        }

        expect(result).to.deep.equal(resultExpected);
    });
});