import fs from 'fs';
import client  from 'cheerio-httpcli';
import co from 'co';
import extend from 'extend';

const FILE_NAME = 'trainInfoUrl.json';
const BASE_URL = 'http://transit.yahoo.co.jp';

co (function *() {
  let areaInf = {};
  let lineInf = {};

  let $ = yield getHtmlDocCo(BASE_URL);
  $('.elmTblLstTrain tr').eq(0).find('a').map((i, el) => {
    areaInf[$(el).text()] = BASE_URL + $(el).attr('href');
  });

  for (let area in areaInf) {
    yield sleep(5000);
    let $ = yield getHtmlDocCo(areaInf[area]);

    $('#mdAreaMajorLine').find('a').map((i, el) => {
      let lineName = $(el).text();
      let lineUrl = $(el).attr('href');
      if (lineUrl.indexOf(BASE_URL) > -1) {
        lineInf[lineName] = lineUrl;
      }
    });
  }

  let trainInf = extend(areaInf, lineInf);
  fs.writeFileSync(FILE_NAME, JSON.stringify(trainInf, null, 2));
})
.catch(err => {
  console.error(err);
});

function getHtmlDocCo(url) {
  return new Promise((resolve, reject) => {
    client.fetch(url)
    .then(result => {
      resolve(result.$);
    })
    .catch(err => {
      reject(err);
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
