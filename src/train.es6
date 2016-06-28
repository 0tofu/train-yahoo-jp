'use strict';
import client from 'cheerio-httpcli';

export default class Train {
  constructor() {
  }

  getTrouble() {
    return client.fetch('http://transit.yahoo.co.jp/traininfo/area/6/')
    .then(result => {
      const trouble = result.$('#mdStatusTroubleLine .elmTblLstLine').text().replace(/\n/g, '');
      return trouble;
    });
  }
}
