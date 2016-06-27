'use strict';
import client from 'cheerio-httpcli';

export default class Train {
  constructor() {
  }

  getTrouble() {
    client.fetch('http://transit.yahoo.co.jp/traininfo/area/6/')
    .then(result => {
      return result.$('#mdStatusTroubleLine .elmTblLstLine').text().replace(/\n/g, '');
    });
  }
}
