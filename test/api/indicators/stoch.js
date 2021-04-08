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
});