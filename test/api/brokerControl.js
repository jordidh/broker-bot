// $ mocha test/api/brokerIndexes.js 

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
//let chaiHttp = require('chai-http');
const should = chai.should();
const expect    = require("chai").expect;

const brokerControl = require('../../api/brokerControl');
const decisionMaker = require('../../api/decisionMakers/demax2');


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

    it('calculates ADX successfully', async () => {
        // Average Directional Index (ADX)
        // El ADX oscila entre 0 y 100
        // Com s'utilitza: 
        //      Cuando el ADX es mayor que 30, el mercado se encuentra en una tendencia fuerte, 
        //      cuando está entre 20 y 30 no está bien definido y cuando es menor a 20 indica 
        //      que el mercado está en rango. Las formas más comunes de utilizar el ADX son:
        //          1. Conocer la fuerza de una tendencia: Cuando el ADX tiene pendiente positiva y/o se sitúa en niveles entre 30 y 40 indica fortaleza de tendencia. En movimientos de tendencia fuerte (ya sea alcista o bajista) el especulador aprovecha las correcciones a la baja (en tendencia alcista) para comprar el valor y los rebotes (en tendencia bajista).
        //          2. Para saber cuando un rango llega a su fin: Cuando el ADX se encuentra por debajo de 20-30 y/o se encuentra entre las líneas de movimiento direccional. Con los precios en rango, los especuladores compran en la parte inferior y venden en la superior, el ADX les permite saber cuando ese rango se termina. Además, la señal de que un rango termina significa que comienza una nueva tendencia, por lo que especulador solo tendrá que subirse a ésta.
        //          3. Determinar cambios de tendencia: Cuando existen divergencias demasiado altas (por encima de 45-50) quiere decir que la tendencia se está agotando o está perdiendo fuerza. Por lo que probablemente se tome un respiro. Por el contrario, cuando estas divergencias se encuentran por encima de 30, pero en lecturas no muy altas entendemos que la tendencia se está fortaleciendo.
        // Per ADX es necessari proporcionar high price, low price i price at close
        // Ex: adxi.update({"high": 30.1983, "low": 29.4072, "close": 29.872});
        // "high" = price[priceIndex - 2], "low" : price[priceIndex - 1], "close" : price[priceIndex]
        const prices = [
            // time, high price, low price, price
            [ 1552055400000, 30.1983, 29.4072, 29.872 ],
            [ 1552055410000, 31.1983, 28.4072, 29.872 ],
            [ 1552055420000, 32.1983, 27.4072, 28.872 ],
            [ 1552055430000, 31.1983, 25.4072, 27.872 ],
            [ 1552055440000, 32.1983, 23.4072, 28.872 ],
            [ 1552055450000, 33.1983, 22.4072, 29.872 ],
            [ 1552055460000, 35.1983, 24.4072, 28.872 ],
            [ 1552055470000, 34.1983, 23.4072, 27.872 ],
            [ 1552055480000, 35.1983, 25.4072, 28.872 ],
            [ 1552055490000, 36.1983, 26.4072, 28.872 ],
            [ 1552055500000, 37.1983, 24.4072, 29.872 ],
            [ 1552055510000, 33.1983, 22.4072, 28.872 ],
            [ 1552055520000, 34.1983, 21.4072, 29.872 ],
            [ 1552055530000, 36.1983, 20.4072, 27.872 ],
            [ 1552055540000, 38.1983, 22.4072, 26.872 ],
            [ 1552055550000, 36.1983, 21.4072, 28.872 ],
            [ 1552055560000, 34.1983, 24.4072, 29.872 ],
            [ 1552055570000, 33.1983, 25.4072, 28.872 ],
            [ 1552055580000, 32.1983, 22.4072, 28.872 ],
            [ 1552055590000, 33.1983, 21.4072, 29.872 ],
            [ 1552055600000, 34.1983, 20.4072, 27.872 ],
            [ 1552055610000, 35.1983, 22.4072, 28.872 ],
            [ 1552055620000, 37.1983, 23.4072, 29.872 ],
            [ 1552055630000, 30.1983, 23.4072, 29.872 ]
        ];

        var demaExpected = {
            "error" : [ ],
            "result" : [
                [ 1552055400000, 0 ],
                [ 1552055410000, 0 ],
                [ 1552055420000, 0 ],
                [ 1552055430000, 0 ],
                [ 1552055440000, 0 ],
                [ 1552055450000, 0 ],
                [ 1552055460000, 0 ],
                [ 1552055470000, 0 ],
                [ 1552055480000, 0 ],
                [ 1552055490000, 0 ],
                [ 1552055500000, 0 ],
                [ 1552055510000, 0 ],
                [ 1552055520000, 0 ],
                [ 1552055530000, 0 ],
                [ 1552055540000, 0 ],
                [ 1552055550000, 0 ],
                [ 1552055560000, 0 ],
                [ 1552055570000, 0 ],
                [ 1552055580000, 0 ],
                [ 1552055590000, 19.95513536707172 ],
                [ 1552055600000, 20.88377898833126 ],
                [ 1552055610000, 20.385140761458732 ],
                [ 1552055620000, 18.919813993160634 ],
                [ 1552055630000, 17.601019901692347 ]
            ]
        };

        let result = await brokerControl.applyIndicator(prices, "ADX", 10, 0, 3);
        
        expect(result).to.deep.equal(demaExpected);
    });

    it('calculates MACD successfully', async () => {
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
                [ 1, { "histogram": 0, "macd": -1.2418221e-12, "signal": -1.2418221e-12 } ],
                [ 2, { "histogram": -34.040000000000326, "macd": -42.55000000000165, "signal": -8.510000000001323 } ],     
                [ 3, { "histogram": -57.797333333333704, "macd": -80.75666666666845, "signal": -22.95933333333475 } ],     
                [ 4, { "histogram": -35.230755555555895, "macd": -66.99777777777962, "signal": -31.767022222223723} ],
                [ 5, { "histogram": -74.47853037037065, "macd": -124.86518518518703, "signal": -50.38665481481638} ],
                [ 6, { "histogram": -39.42677491358047, "macd": -99.67012345679198, "signal": -60.2433485432115} ],
                [ 7, { "histogram": -42.48983145349812, "macd": -113.35563786008416, "signal": -70.86580640658603} ],
                [ 8, { "histogram": 4.852601229519743, "macd": -64.80005486968635, "signal": -69.6526560992061} ],
                [ 9, { "histogram": 1.3968610476304302, "macd": -67.90657978966806, "signal": -69.3034408372985} ],
                [ 10, { "histogram": -7.335834740618409, "macd": -78.4732342630715, "signal": -71.1373995224531} ],
                [ 11, { "histogram": 2.5769463923348224, "macd": -67.91621653203457, "signal": -70.49316292436939} ],
                [ 12, { "histogram": 112.49768764952468, "macd": 70.12894663753646, "signal": -42.36874101198822} ],
                [ 13, { "histogram": 86.06147750309223, "macd": 65.20810586687708, "signal": -20.85337163621516} ],
                [ 14, { "histogram": 12.408480378022537, "macd": -5.342771163686989, "signal": -17.751251541709525} ],
                [ 15, { "histogram": -69.40443451836045, "macd": -104.50679468966007, "signal": -35.10236017129964} ],
                [ 16, { "histogram": -118.68305496336654, "macd": -183.45617887550782, "signal": -64.77312391214127} ],
                [ 17, { "histogram": -49.15145824808733, "macd": -126.21244672225043, "signal": -77.06098847416311} ],
                [ 18, { "histogram": -112.7707347983799, "macd": -218.024406972138, "signal": -105.25367217375808} ],
                [ 19, { "histogram": -129.3148195325264, "macd": -266.89719658941607, "signal": -137.58237705688967} ],
                [ 20, { "histogram": -13.675961053196914, "macd": -154.67732837338582, "signal": -141.0013673201889} ]
            ]
        };

        let result = await brokerControl.applyIndicator(prices, "MACD", { "longInterval": 5, "shortInterval": 2, "signal": 9}, 0, 1);
        
        expect(result).to.deep.equal(demaExpected);
    });

    it('calculates BBAND successfully', async () => {
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
                [ 1, { "lower": 0, "middle": 0, "upper": 0 } ],
                [ 2, { "lower": 0, "middle": 0, "upper": 0 } ],
                [ 3, { "lower": 0, "middle": 0, "upper": 0 } ],
                [ 4, { "lower": 0, "middle": 0, "upper": 0 } ],
                [ 5, { "lower": 0, "middle": 0, "upper": 0 } ],
                [ 6, { "lower": 0, "middle": 0, "upper": 0 } ],
                [ 7, { "lower": 0, "middle": 0, "upper": 0 } ],
                [ 8, { "lower": 0, "middle": 0, "upper": 0 } ],
                [ 9, { "lower": 0, "middle": 0, "upper": 0 } ],
                [ 10, { "lower": 40631.36769022596, "middle": 41025.1, "upper": 41418.832309774036 } ],
                [ 11, { "lower": 40622.588428407114, "middle": 40960.665, "upper": 41298.74157159289 } ],
                [ 12, { "lower": 40653.548616738015, "middle": 40945.177, "upper": 41236.805383261984 } ],
                [ 13, { "lower": 40666.6524622455, "middle": 40935.147, "upper": 41203.6415377545 } ],
                [ 14, { "lower": 40686.29626145509, "middle": 40907.336, "upper": 41128.375738544906 } ],
                [ 15, { "lower": 40603.03666522315, "middle": 40876.867, "upper": 41150.69733477684 } ],
                [ 16, { "lower": 40428.947683935236, "middle": 40819.265, "upper": 41209.58231606476 } ],
                [ 17, { "lower": 40349.013269891606, "middle": 40784.299, "upper": 41219.5847301084 } ],
                [ 18, { "lower": 40115.40604503088, "middle": 40701.637, "upper": 41287.867954969115 } ],
                [ 19, { "lower": 39844.20940304794, "middle": 40604.388, "upper": 41364.566596952056 } ],
                [ 20, { "lower": 39716.66121605769, "middle": 40533.76, "upper": 41350.858783942305 } ] 
            ]
        };

        let result = await brokerControl.applyIndicator(prices, "BBANDS", 10, 0, 1);
        
        expect(result).to.deep.equal(demaExpected);
    });

    it('calculates STOCH successfully', async () => {
        const prices = [
            // time, high price, low price, price
            [ 1552055400000, 30.1983, 29.4072, 29.872 ],
            [ 1552055410000, 31.1983, 28.4072, 29.872 ],
            [ 1552055420000, 32.1983, 27.4072, 28.872 ],
            [ 1552055430000, 31.1983, 25.4072, 27.872 ],
            [ 1552055440000, 32.1983, 23.4072, 28.872 ],
            [ 1552055450000, 33.1983, 22.4072, 29.872 ],
            [ 1552055460000, 35.1983, 24.4072, 28.872 ],
            [ 1552055470000, 34.1983, 23.4072, 27.872 ],
            [ 1552055480000, 35.1983, 25.4072, 28.872 ],
            [ 1552055490000, 36.1983, 26.4072, 28.872 ],
            [ 1552055500000, 37.1983, 24.4072, 29.872 ],
            [ 1552055510000, 33.1983, 22.4072, 28.872 ],
            [ 1552055520000, 34.1983, 21.4072, 29.872 ],
            [ 1552055530000, 36.1983, 20.4072, 27.872 ],
            [ 1552055540000, 38.1983, 22.4072, 26.872 ],
            [ 1552055550000, 36.1983, 21.4072, 28.872 ],
            [ 1552055560000, 34.1983, 24.4072, 29.872 ],
            [ 1552055570000, 33.1983, 25.4072, 28.872 ],
            [ 1552055580000, 32.1983, 22.4072, 28.872 ],
            [ 1552055590000, 33.1983, 21.4072, 29.872 ],
            [ 1552055600000, 34.1983, 20.4072, 27.872 ],
            [ 1552055610000, 35.1983, 22.4072, 28.872 ],
            [ 1552055620000, 37.1983, 23.4072, 29.872 ],
            [ 1552055630000, 30.1983, 23.4072, 29.872 ]
        ];

        var expected = {
            "error" : [ ],
            "result" : [
                [ 1552055400000, 0 ],
                [ 1552055410000, 0 ],
                [ 1552055420000, 0 ],
                [ 1552055430000, 0 ],
                [ 1552055440000, 0 ],
                [ 1552055450000, 0 ],
                [ 1552055460000, 0 ],
                [ 1552055470000, 0 ],
                [ 1552055480000, 0 ],
                [ 1552055490000, 0 ],
                [ 1552055500000, 0 ],
                [ 1552055510000, 0 ],
                [ 1552055520000, 0 ],
                [ 1552055530000, 44.46 ],
                [ 1552055540000, 36.34 ],
                [ 1552055550000, 47.58 ],
                [ 1552055560000, 53.20 ],
                [ 1552055570000, 47.58 ],
                [ 1552055580000, 47.58 ],
                [ 1552055590000, 53.20 ],
                [ 1552055600000, 41.96 ],
                [ 1552055610000, 47.58 ],
                [ 1552055620000, 53.20 ],
                [ 1552055630000, 53.20 ]
            ]
        };

        let result = await brokerControl.applyIndicator(prices, "STOCH", { "period" : 14, "smoth" : 1 }, 0, 3);
        
        expect(result).to.deep.equal(expected);
    });
});

describe('BrokerControl.analizeStrategy()', () => {
    it('gives error if strategy is not defined', async () => {
        const analysisBatchNumber = "Proves-0001";
        const analysisId = 1;
        const funds = 1000;   // €
        const market = {
            "id" : "BTC",
            "api" : "",  // pel test no es fa servir
            "strategy" : "",  // <----- no posem cap estratègia, ha de fallar
            "decisionWindow" : "",
            comission: [ 2, 4],  // comprar 2%, vendre 4%
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
            "error" : [ "strategy \"\" incorrect and does not match with the decisionMarker provided" ],
            "result" : { }
        };

        let result = await brokerControl.analizeStrategy(analysisBatchNumber, analysisId, funds, market, prices, decisionMaker);

        //console.log(result);

        expect(result).to.deep.equal(expectedResult);
    });

    it('gives error if strategy is not found', async () => {
        const analysisBatchNumber = "Proves-0001";
        const analysisId = 1;
        const funds = 1000;   // €
        const market = {
            "id" : "BTC",
            "api" : "",  // pel test no es fa servir
            "strategy" : "NOT_DEFINED",  // <----- posem una estratègia que no existeix, ha de fallar
            "decisionWindow" : "",
            comission: [ 2, 4],  // comprar 2%, vendre 4%
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
            "error" : [ "strategy \"NOT_DEFINED\" incorrect and does not match with the decisionMarker provided" ],
            "result" : { }
        };

        let result = await brokerControl.analizeStrategy(analysisBatchNumber, analysisId, funds, market, prices, decisionMaker);

        //console.log(result);

        expect(result).to.deep.equal(expectedResult);
    });

    it('gives error if strategy demax2 has a invalid indicators', async () => {
        const analysisBatchNumber = "Proves-0001";
        const analysisId = 1;
        const funds = 1000;   // €
        const market = {
            "id" : "BTC",
            "api" : "",  // pel test no es fa servir
            "strategy" : "demax2",  // <----- posem una estratègia que necessita 2 indicadors DEMA
            "decisionWindow" : "",
            comission: [ 2, 4],  // comprar 2%, vendre 4%
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

        let result = await brokerControl.analizeStrategy(analysisBatchNumber, analysisId, funds, market, prices, decisionMaker);

        //console.log(result);

        expect(result).to.deep.equal(expectedResult);
    });

    it('calculates one buy and one sell with strategy demax2 and -48€ of profit', async () => {
        const analysisBatchNumber = "Proves-0001";
        const analysisId = 1;
        const funds = 1000;   // €
        const market = {
            "id" : "BTC",
            "api" : "",  // pel test no es fa servir
            "strategy" : "demax2",
            "decisionWindow" : "",
            comission: [ 2, 4],  // comprar 2%, vendre 4%
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

        let result = await brokerControl.analizeStrategy(analysisBatchNumber, analysisId, funds, market, prices, decisionMaker);

        //console.log(result);

        expect(result).to.deep.equal(expectedResult);
    });

    it('calculates two buy and two sell with strategy demax2 and +13€ of profit', async () => {
        const analysisBatchNumber = "Proves-0001";
        const analysisId = 2;
        const funds = 1000;   // €
        const market = {
            "id" : "BTC",
            "api" : "",  // pel test no es fa servir
            "strategy" : "demax2",
            "decisionWindow" : "",
            comission: [ 2, 4],  // comprar 2%, vendre 4%
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

        let result = await brokerControl.analizeStrategy(analysisBatchNumber, analysisId, funds, market, prices, decisionMaker);

        //console.log(result);

        expect(result).to.deep.equal(expectedResult);
    });
});