import client from 'cheerio-httpcli';
import co from 'co';

import trainInfoUrl from '../files/trainInfoUrl.json';

export default class Train {
  constructor() {
  }

  findNameToUrl(name) {
    let keys = [];
    for (let line in trainInfoUrl) {
      if (line.indexOf(name) > -1) {
        keys.push({
          'name': line,
          'url': trainInfoUrl[line],
        });
      }
    }
    if (keys.length === 0) {
      return '該当の路線はありません。';
    }
    return keys;
  }

  getTrainInfo(name) {
    let nameUrls = this.findNameToUrl(name);
    return co(function* () {
      let tInf = [];
      for (let i = 0; i < nameUrls.length; i++) {
        const result = yield client.fetch(nameUrls[i].url);
        const $ = result.$;

        const trainInfo = $('#mdServiceStatus dt').text();
        const replaceStr = $('#mdServiceStatus dt span').text();
        let status = trainInfo.replace(replaceStr, '').replace(/\n/g, '');
        let trouble = $('#mdServiceStatus .trouble').text().replace(/\n/g, '');

        tInf.push({
          'name': nameUrls[i].name,
          'status': status,
          'trouble': trouble,
        });
      }
      return tInf;
    });
  }
}
