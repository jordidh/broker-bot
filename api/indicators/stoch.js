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
 * The formula for the smothed Stochastic Oscillator Is
 * k = SMA(STOCH, 3) => (k + k-1 + k-2) / 3
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
    smoth = 3;
    values = [];    // guarda values en format { "high" : H, "low" : L, "close" : C }
    kvalues = [];   // guarda el resultat de la k, per poder calcular fàcilment l'smothed k

    constructor(period, smoth) {

        if (smoth === 0) {
            throw Error("Smoth must be 1 or higger");
        }
        this.period = period;
        this.smoth = smoth;
        this.values = [];
        this.kvalues = [];
    }

    // Guarda values en format { "high" : H, "low" : L, "close" : C }
    update(value) {

        if (typeof value === "object") {

            if (Array.isArray(value)) {
                // Suposem high, low, close
                this.values.push({
                    "high" : value[0],
                    "low" : value[1],
                    "close" : value[2]
                });
            } else {
                if (!value.hasOwnProperty("high") || !value.hasOwnProperty("low") || !value.hasOwnProperty("close")) {
                    throw Error("Value format must be { \"high\" : H, \"low\" : L, \"close\" : C }");
                }
                this.values.push(value);
            }
        } else {
            throw Error("Value must be an object or an array");
        }

        this.kvalues.push(this.calculatekflexible(this.period));

        // Ens guardem 3 mes per poder calcular l'SMA de stock, stoch-1 i stoch-2
        if (this.values.length > (this.period + this.smoth)) {
            let shifted = this.values.shift();
            let shiftedk = this.kvalues.shift();
        }

        // Per començar a tenir dades estables necessitem tenir com a dades anteriors el període + smoth 
        // per poder obtenir k amb un nombre anterior a dades = període i un nombre de k anteriors igual
        // a l'smoth 
        this.isStable = (this.values.length >= (this.period + this.smoth - 1));
    }

    getResult() {

        if (this.isStable === false) {
            return 0;
        }

        let kTotal = 0;
        for (let i = 0; i < this.smoth; i ++) {
            kTotal += this.calculateK(this.values.length - this.period - i, this.values.length - i);
        }

        // Retornem amb 2 decimals per simplificar, de fet és un tant per cent
        return parseFloat( (kTotal / this.smoth).toFixed(2) );

        //let k = this.calculateK(this.values.length - this.period, this.values.length);
        //let k1 = this.calculateK(this.values.length - this.period - 1, this.values.length - 1);
        //let k2 = this.calculateK(this.values.length - this.period - 2, this.values.length - 2);
        //return parseFloat(((k + k1 + k2) / 3).toFixed(2));
        //return (this.kvalues[0] + this.kvalues[1] + this.kvalues[2]) / 3;
    }

    calculatekflexible(period) {
        let startIndex = (this.values.length > period ? this.values.length - period : 0);
        let endIndex = this.values.length - 1;

        if (endIndex <= 1) {
            return 0;
        }

        let higgest = this.values[startIndex].high;
        let lowest = this.values[startIndex].low;
        let close = this.values[endIndex - 1].close;
    
        // Busquem el preu mes alt i el mes baix
        for (let i = (startIndex + 1); i < endIndex; i++) {
            if (higgest < this.values[i].high) {
                higgest = this.values[i].high;
            }
            if (lowest > this.values[i].low) {
                lowest = this.values[i].low;
            }
        }
    
        // Calculem: %K=( ( C - L14 ) / (H14 - L14) ) x 100
        //console.log("close=" + close + ", high=" + higgest + ", low=" + lowest);
        return ((close - lowest) / (higgest - lowest)) * 100;
    }

    calculateK(startIndex, endIndex) {
        let higgest = this.values[startIndex].high;
        let lowest = this.values[startIndex].low;
        let close = this.values[endIndex - 1].close;
    
        // Busquem el preu mes alt i el mes baix
        for (let i = (startIndex + 1); i < endIndex; i++) {
            if (higgest < this.values[i].high) {
                higgest = this.values[i].high;
            }
            if (lowest > this.values[i].low) {
                lowest = this.values[i].low;
            }
        }
    
        // Calculem: %K=( ( C - L14 ) / (H14 - L14) ) x 100
        //console.log("close=" + close + ", high=" + higgest + ", low=" + lowest);
        return ((close - lowest) / (higgest - lowest)) * 100;
    }
}

module.exports = Stoch;