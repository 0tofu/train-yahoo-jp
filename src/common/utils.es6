import client from 'cheerio-httpcli';
import co from 'co';

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

/**
 * 引数で指定したURLよりhtml要素を取得する関数.
 *
 * @param url
 * @returns {Promise}
 */
function getData(url) {
  return new Promise((resolve, reject) => {
    const maxRetryCount = 5;
    co(function*() {
      for (let i = 1; i <= maxRetryCount; i++) {
        let result = {};
        try {
          result = yield client.fetch(url);
        } catch (e) {
          result = {error: e};
        }

        if (!result.error) {
          resolve(result.$);
          break;
        }

        console.log('*** Error ***, url => ' + url + ',  処理回数 => ' + i);
        if (i == maxRetryCount) {
          console.log('Error => ' + url);
          reject(new Error(result.error));
        }
        yield utils.sleep(5000);
      }
    });
  });
}

module.exports = {
  sleep: sleep,
  getData: getData,
};
