'use strict';
import client from 'cheerio-httpcli';
import Promise from 'bluebird';

import trainInfoUrl from '../trainInfoUrl.json';

export default class Train {
  constructor() {
  }

  findNameToUrl(name) {
    let keys = [];
    Object.keys(trainInfoUrl).forEach(key => {
      if (key.indexOf(name) > -1) {
        keys.push({
          'name': key,
          'url': trainInfoUrl[key],
        });
      }
    });
    if (keys.length === 0) {
      throw '該当の路線はありません。';
    }
    return keys;
  }

  getTrainInfo(name) {
    let tInf = [];
    let nameUrls = this.findNameToUrl(name);
    return Promise.each(nameUrls, nameUrl => {
      return client.fetch(nameUrl.url)
      .then(result => {
        // const trouble = result.$('#mdStatusTroubleLine .elmTblLstLine').text().replace(/\n/g, ''); // 近畿の情報
        const trainInfo = result.$('#mdServiceStatus dt').text();
        const replaceStr = result.$('#mdServiceStatus dt span').text();
        tInf.push({
          'name': nameUrl.name,
          'jokyo': trainInfo.replace(replaceStr, ''),
        });
      });
    })
    .then(() => {
      return tInf;
    });
  }
}
