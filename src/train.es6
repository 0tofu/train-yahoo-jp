import client from 'cheerio-httpcli';
import co from 'co';

import trainInfoUrl from '../trainInfoUrl.json';

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
      throw '該当の路線はありません。';
    }
    return keys;
  }

  getTrainInfo(name) {
    let tInf = [];
    let nameUrls = this.findNameToUrl(name);

    return co(function* () {
      for (let i = 0; i < nameUrls.length; i++) {
        const result = yield client.fetch(nameUrls[i].url);
        const $ = result.$;
        // const trouble = result.$('#mdStatusTroubleLine .elmTblLstLine').text().replace(/\n/g, ''); // 近畿の情報
        const trainInfo = $('#mdServiceStatus dt').text();
        const replaceStr = $('#mdServiceStatus dt span').text();
        tInf.push({
          'name': nameUrls[i].name,
          'jokyo': trainInfo.replace(replaceStr, ''),
        });
      }
    })
    .then(() => {
      return tInf;
    });
  }
}
