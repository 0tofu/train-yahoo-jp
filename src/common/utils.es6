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

/**
 * 正規表現の特殊文字をエスケープする関数.
 *
 * @param str
 * @param delimiter
 * @returns {string}
 */
function preg_quote (str, delimiter) {
  // Quote regular expression characters plus an optional character
  //
  // version: 1107.2516
  // discuss at: http://phpjs.org/functions/preg_quote
  // +   original by: booeyOH
  // +   improved by: Ates Goral (http://magnetiq.com)
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   bugfixed by: Onno Marsman
  // +   improved by: Brett Zamir (http://brett-zamir.me)
  // *     example 1: preg_quote("$40");
  // *     returns 1: '\$40'
  // *     example 2: preg_quote("*RRRING* Hello?");
  // *     returns 2: '\*RRRING\* Hello\?'
  // *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
  // *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'
  return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
}


module.exports = {
  preg_quote: preg_quote,
  sleep: sleep,
  getData: getData,
};
