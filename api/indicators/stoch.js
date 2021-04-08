/**
 * A stochastic oscillator is a momentum indicator comparing a particular closing 
 * price of a security to a range of its prices over a certain period of time. 
 * The sensitivity of the oscillator to market movements is reducible by adjusting 
 * that time period or by taking a moving average of the result. It is used to 
 * generate overbought and oversold trading signals, utilizing a 0–100 bounded 
 * range of values.
 * 
 * Traditionally, readings over 80 are considered in the overbought range, and 
 * readings under 20 are considered oversold. However, these are not always 
 * indicative of impending reversal; very strong trends can maintain overbought 
 * or oversold conditions for an extended period. Instead, traders should look 
 * to changes in the stochastic oscillator for clues about future trend shifts.
 * 
 * The Formula for the Stochastic Oscillator Is
 * %K=( ( C - L14 ) / (H14 - L14) ) x 100
 * where:
 * C = The most recent closing price
 * L14 = The lowest price traded of the 14 previous trading sessions
 * H14 = The highest price traded during the same 14-day period
 * %K = The current value of the stochastic indicator
 * 
 * Example, if the 14-day high is $150, the low is $125 and the current close 
 * is $145, then the reading for the current session would be: 
 * (145-125) / (150 - 125) * 100 = 80%.
 * 
 * Notably, %K is referred to sometimes as the fast stochastic indicator. The 
 * "slow" stochastic indicator is taken as %D = 3-period moving average of %K.
 * 
 * The primary limitation of the stochastic oscillator is that it has been known 
 * to produce false signals. This is when a trading signal is generated by the 
 * indicator, yet the price does not actually follow through, which can end up 
 * as a losing trade. During volatile market conditions, this can happen quite 
 * regularly. One way to help with this is to take the price trend as a filter, 
 * where signals are only taken if they are in the same direction as the trend.
 */
class Stoch {
    isStable = false;
    period = 14;
    values = [];    // guarda values en format { "high" : H, "low" : L, "close" : C }

    constructor(period) {
        this.period = period;
        this.values = [];
    }

    // Guarda values en format { "high" : H, "low" : L, "close" : C }
    update(value) {
        if (!value.hasOwnProperty("high") || !value.hasOwnProperty("low") || !value.hasOwnProperty("close")) {
            throw Error("Value format must be { \"high\" : H, \"low\" : L, \"close\" : C }");
        }

        this.values.push(value);

        if (this.values.length > this.period) {
            let shifted = this.values.shift();
            //console.log("shifted=", shifted);
        } else {
            this.isStable = false;
        }

        this.isStable = (this.values.length >= this.period);
    }

    getResult() {

        if (this.isStable === false) {
            return 0;
        }

        let higgest = this.values[0].high;
        let lowest = this.values[0].low;
        let close = this.values[this.values.length - 1].close;

        //console.log(this.values);

        // Busquem el preu mes alt i el mes baix
        for (let i = 1; i < this.values.length; i++) {
            if (higgest < this.values[i].high) {
                higgest = this.values[i].high;
            }
            if (lowest > this.values[i].low) {
                lowest = this.values[i].low;
            }
        }

        // Calculem: %K=( ( C - L14 ) / (H14 - L14) ) x 100
        //console.log("close=" + close + ", high=" + higgest + ", low=" + lowest);
        let k = (close - lowest) / (higgest - lowest) * 100;

        return k;
    }
}

module.exports = Stoch;