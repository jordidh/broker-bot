//Highcharts.getJSON('https://demo-live-data.highcharts.com/aapl-ohlc.json', function (data) {    // funciona og
//Highcharts.getJSON('https://api.kraken.com/0/public/OHLC?pair=BTCEUR&interval=5', function (data) {   // dona error de cors

//Highcharts.getJSON('http://localhost:4300/data/', function (data) {   // funciona correctament sempre que es posi "http"
Highcharts.getJSON('http://localhost:4300/data/kraken', function (data) {   // funciona correctament sempre que es posi "http"

  // create the chart
  Highcharts.stockChart('container', {

    rangeSelector: {
      selected: 2
    },

    title: {
      text: 'AAPL Stock Price'
    },

    series: [{
      type: 'ohlc',
      name: 'AAPL Stock Price',
      data: data,
      dataGrouping: {
        units: [[
          'week', // unit name
          [1] // allowed multiples
        ], [
          'month',
          [1, 2, 3, 4, 6]
        ]]
      }
    }]
  });
});