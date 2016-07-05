/**
 * Yahoo!路線情報(http://transit.yahoo.co.jp)より
 * 日本各地の在来線・私鉄・地下鉄の路線名・URLを取得し
 * "trainInfoUrl.json"を作成する処理
 */

import fs from 'fs';
import client  from 'cheerio-httpcli';
import co from 'co';

const FILE_NAME = 'trainInfoUrl.json';
const BASE_URL = 'http://transit.yahoo.co.jp';

co(function* () {
  let areaInf = {};
  let lineInf = {};

  // 元となるURLより各地方の路線情報URLを取得
  let result = yield client.fetch(BASE_URL);
  let $ = result.$;
  $('.elmTblLstTrain tr').eq(0).find('a').map((i, el) => {
    areaInf[$(el).text()] = BASE_URL + $(el).attr('href');
  });

  // 各地方の路線情報URLより地方路線のURLを取得
  for (let area in areaInf) {
    yield sleep(5000);
    let result = yield client.fetch(areaInf[area]);
    let $ = result.$;
    $('#mdAreaMajorLine').find('a').map((i, el) => {
      let lineName = $(el).text();
      let lineUrl = $(el).attr('href');
      if (lineUrl.indexOf(BASE_URL) > -1) {
        lineInf[lineName] = lineUrl;
      }
    });
  }

  fs.writeFileSync(FILE_NAME, JSON.stringify(lineInf, null, 2));
})
.catch(err => {
  console.error(err);
});

/**
 * 指定したミリ秒間処理を停止する関数
 * @param  {number} ms 時間(ミリ秒)
 * @return {Object}    Promise
 */
function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
