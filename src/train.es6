'use strict';
let client = require('cheerio-httpcli');

client.fetch('http://transit.yahoo.co.jp/traininfo/area/6/')
.then(result => {
  console.log(result.$('#mdStatusTroubleLine .elmTblLstLine').text().replace(/\n/g, ''));
});
