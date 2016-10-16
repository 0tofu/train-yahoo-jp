/**
 * Yahoo!路線情報より
 * 日本各地の駅名・URLを取得し
 * "trainStatinListUrl.json"を作成する処理
 */

import fs from 'fs';
import client from 'cheerio-httpcli';
import co from 'co';

const stationListFile = __dirname + '/../files/stationListUrl.json';
const BASE_URL = 'http://transit.yahoo.co.jp';

client.timeout = 120000;

co(function* () {
  let pref_urls = [];
  let pref_lines = {};
  let stationLists = {};

  // 駅情報ページにアクセスし都道府県URLを取得
  let result = yield client.fetch(BASE_URL + '/station/top');
  let $ = result.$;
  $('.elmSearchItem').eq(0).find('li a').map((i, el) => {
    const pref = $(el).text();
   // if (pref == '大阪' || pref == '京都' || pref == '滋賀') {
      pref_urls.push(getData($(el).url()));
   // }
  });

  // 都道府県別の路線URLを取得
  const results = yield Promise.all(pref_urls);
  results.map($ => {
    const pref = $('h1.title').text();
    pref_lines[pref] = $('.elmSearchItem.line > li a').map((i, el) => {
      return getData($(el).url());
    }).get();
  });

  // 都道府県別に路線URLの駅情報を取得
  for (let pref in pref_lines) {
    const results = yield Promise.all(pref_lines[pref]);
    results.map($ => {
      $('.elmSearchItem.quad > li a').map((i, el) => {
        const station_name = $(el).text();
        const station_url = $(el).url().replace(/\?.*/g, '');
        if ((station_name in stationLists) && stationLists[station_name].url != station_url) {
          console.log('Error => ' + station_name);
        }
        stationLists[station_name] = {url: station_url, lines: []};
      });
    })
  }

  //
  let stations = [];
  let index = 0;
  for (let station_name in stationLists) {
    if (!Array.isArray(stations[index])) {
      stations[index] = [];
    }
    stations[index].push(getData(stationLists[station_name].url));
    if (stations[index].length == 100) {
      index++;
      console.log('sleep 3sec => ' + index);
      yield sleep(3000);
    }
  }

  for (let index in stations) {
    yield sleep(500);
    const results = yield Promise.all(stations[index]);
    results.map($ => {
      let station_name = $('h1.title').text();
      const lines = $('.elmStaItem.dia .labelSmall .title').map((i, el) => {
        return $(el).text();
      }).get();

      station_name = station_name.replace('西新湊', '射水市新湊庁舎前');
      stationLists[station_name].lines = replaceLineName(lines);
    })
  }

  fs.writeFileSync(stationListFile, JSON.stringify(stationLists, null, 2));
})
.catch(err => {
  console.log('======== Error ========');
  console.log(err);
});

function replaceLineName(lines) {
  let return_lines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    line = line.replace(/.*新幹線$/, '');
    line = line.replace('えちごトキめき鉄道', '');
    line = line.replace('北総鉄道', '');
    line = line.replace('名古屋臨海高速鉄道', '');
    line = line.replace('富士急', '');
    line = line.replace('山万', '');
    line = line.replace('愛知高速交通', '');
    line = line.replace('智頭急行', '');
    line = line.replace('東京臨海高速鉄道', '');
    line = line.replace('横浜市営地下鉄', '');
    line = line.replace('野岩鉄道', '');
    line = line.replace('錦川鉄道', '');
    line = line.replace('鹿島臨海鉄道', '');
    line = line.replace('ＩＧＲ', '');
    line = line.replace('ＢＲＴ', '');

    line = line.replace('電気鉄道', '電鉄');
    line = line.replace('市地下鉄', '市営地下鉄');
    line = line.replace('市営地下鉄', '市営');

    line = line.replace('ＪＲ京都線', 'JR京都線');
    line = line.replace('ＪＲ東西線', 'JR東西線');
    line = line.replace('ＪＲ神戸線', 'JR神戸線');
    line = line.replace('ＪＲ宝塚線', 'JR宝塚線');
    line = line.replace('ＪＲゆめ咲線', 'JRゆめ咲線');
    line = line.replace('ＪＲ埼京線', '埼京川越線');
    line = line.replace('ＪＲ川越線', '埼京川越線');
    line = line.replace('ＪＲ根岸線', '京浜東北根岸線');
    line = line.replace('ＪＲ京浜東北線', '京浜東北根岸線');
    line = line.replace('ＪＲ中央線快速', '中央線(快速)');
    line = line.replace('ＪＲ総武線快速', '総武線(快速)');
    line = line.replace('ＪＲ中央・総武線各駅停車', '中央総武線(各停)');
    line = line.replace('ＪＲ久大本線', 'ゆふ高原線');
    line = line.replace('ＪＲ万葉まほろば線', '桜井線');
    line = line.replace('ＪＲ予讃線・内子線', '予讃線');
    line = line.replace('ＪＲ仙石東北ライン', '仙石線');
    line = line.replace('ＪＲ常磐線快速', '常磐線(快速)');
    line = line.replace('ＪＲ常磐線各駅停車', '常磐線(各停)');
    line = line.replace('ＪＲ豊肥本線', '阿蘇高原線');
    line = line.replace('ＪＲ', '');

    line = line.replace('北条鉄道', '北条鉄道北条線');
    line = line.replace('明知鉄道', '明知鉄道明知線');
    line = line.replace('樽見鉄道', '樽見鉄道樽見線');
    line = line.replace('水間鉄道', '水間鉄道水間線');
    line = line.replace('若桜鉄道', '若桜鉄道若桜線');
    line = line.replace('いすみ鉄道', 'いすみ鉄道いすみ線');
    line = line.replace('伊勢鉄道', '伊勢鉄道伊勢線');

    line = line.replace('小湊鉄道', '小湊鉄道線');
    line = line.replace('島原鉄道', '島原鉄道線');
    line = line.replace('津軽鉄道', '津軽鉄道線');
    line = line.replace('秩父鉄道', '秩父鉄道線');
    line = line.replace('紀州鉄道', '紀州鉄道線');
    line = line.replace('芝山鉄道', '芝山鉄道線');
    line = line.replace('遠州鉄道', '遠州鉄道線');
    line = line.replace(/しなの鉄道$/, 'しなの鉄道線');
    line = line.replace('ゆりかもめ', 'ゆりかもめ線');
    line = line.replace('あいの風とやま鉄道', 'あいの風とやま鉄道線');
    line = line.replace('ディズニーリゾートライン', 'ディズニーリゾートライン線');
    line = line.replace('埼玉高速鉄道', '埼玉高速鉄道線');
    line = line.replace('愛知環状鉄道', '愛知環状鉄道線');
    line = line.replace('江ノ島電鉄', '江ノ島電鉄線');
    line = line.replace('泉北高速鉄道', '泉北高速鉄道線');
    line = line.replace('湘南モノレール', '湘南モノレール線');
    line = line.replace('筑豊電鉄', '筑豊電鉄線');
    line = line.replace('箱根登山鉄道', '箱根登山鉄道線');
    line = line.replace('肥薩おれんじ鉄道', '肥薩おれんじ鉄道線');
    line = line.replace('道南いさりび鉄道', '道南いさりび鉄道線');
    line = line.replace('阿武隈急行', '阿武隈急行線');
    line = line.replace('青い森鉄道', '青い森鉄道線');
    line = line.replace('ＩＲいしかわ鉄道', 'IRいしかわ鉄道線');

    line = line.replace('銚子電鉄', '銚子電気鉄道線');

    line = line.replace('くま川鉄道湯前線', 'くま川鉄道線');
    line = line.replace(/とさでん交通.*/g, 'とさでん交通線');

    line = line.replace('京成成田スカイアクセス線', '成田スカイアクセス');

    line = line.replace('名鉄竹鼻線', '名鉄竹鼻・羽島線');
    line = line.replace('名鉄羽島線', '名鉄竹鼻・羽島線');

    line = line.replace('嵐電', '京福電鉄');

    line = line.replace('大阪市営ニュートラム南港ポートタウン線', 'ニュートラム');

    line = line.replace(/大阪環状線.*/, '大阪環状線');
    line = line.replace(/大阪モノレール.*/g, '大阪モノレール線');

    line = line.replace('神鉄三田線', '神戸電鉄有馬・三田線');
    line = line.replace('神鉄有馬線', '神戸電鉄有馬・三田線');
    line = line.replace('神鉄', '神戸電鉄');

    line = line.replace('京阪本線', '京阪本線・鴨東線');
    line = line.replace('京阪鴨東線', '京阪本線・鴨東線');

    line = line.replace('京都丹後鉄道宮舞線', '京都丹後鉄道宮舞線・宮豊線');
    line = line.replace('京都丹後鉄道宮豊線', '京都丹後鉄道宮舞線・宮豊線');

    line = line.replace('近鉄奈良線', '近鉄奈良線・難波線');
    line = line.replace('近鉄難波線', '近鉄奈良線・難波線');

    line = line.replace('伊予鉄道本町線', '伊予鉄松山市内線');
    line = line.replace('伊予鉄道松山市駅線', '伊予鉄松山市内線');
    line = line.replace('伊予鉄道環状線', '伊予鉄松山市内線');
    line = line.replace('伊予鉄道松山駅前線', '伊予鉄松山市内線');
    line = line.replace('伊予鉄道', '伊予鉄');

    line = line.replace('信楽高原鐵道', '信楽高原鉄道信楽線');
    line = line.replace('北神急行電鉄', '北神急行電鉄北神線');

    line = line.replace('土佐くろしお鉄道中村線', '土佐くろしお鉄道中村・宿毛線');
    line = line.replace('土佐くろしお鉄道宿毛線', '土佐くろしお鉄道中村・宿毛線');

    line = line.replace(/函館市電.*/, '函館市電');
    line = line.replace(/札幌市電.*/, '札幌市電');
    line = line.replace(/北九州モノレール.*/, '北九州モノレール線');
    line = line.replace(/千葉都市モノレール.*/, '千葉都市モノレール線');
    line = line.replace(/南阿蘇鉄道.*/, '南阿蘇鉄道線');
    line = line.replace(/名古屋市営名城線.*/, '名古屋市営名城線');
    line = line.replace(/四日市あすなろう鉄道.*/, '四日市あすなろう鉄道線');
    line = line.replace('多摩モノレール', '多摩都市モノレール線');
    line = line.replace('大井川鐵道', '大井川鉄道');
    line = line.replace('天竜浜名湖鉄道', '天竜浜名湖線');
    line = line.replace('富山ライトレール', '富山ライトレール富山港線');
    line = line.replace('富山地方鉄道上滝線', '富山地方鉄道不二越・上滝線');
    line = line.replace('富山地方鉄道不二越線', '富山地方鉄道不二越・上滝線');
    line = line.replace(/富山地方鉄道.*系統.*/, '富山地方鉄道本線');
    line = line.replace(/岡山電気軌道.*/, '岡山電気軌道線');
    line = line.replace(/広島電鉄.*号線/, '広島電鉄市内線');
    line = line.replace('東京モノレール羽田空港線', '東京モノレール線');
    line = line.replace('東葉高速鉄道', '東葉高速線');
    line = line.replace('松本電鉄', 'アルピコ交通');
    line = line.replace(/松浦鉄道.*/, '松浦鉄道線');
    line = line.replace('横浜シーサイドライン', '金沢シーサイドライン');
    line = line.replace('水島臨海鉄道', '水島臨海鉄道水島本線');
    line = line.replace(/熊本市電.*/, '熊本市電');
    line = line.replace(/熊本電鉄.*/, '熊本電鉄線');
    line = line.replace('真岡鐵道', '真岡鉄道');
    line = line.replace('神戸新交通ポートアイランド線', 'ポートライナー');
    line = line.replace('神戸新交通六甲アイランド線', '六甲ライナー');
    line = line.replace(/長崎電気軌道.*/, '長崎市内線');
    line = line.replace(/山手線.*/, '山手線');
    line = line.replace('都営地下鉄', '都営');
    line = line.replace('豊橋鉄道東田本線', '豊橋鉄道市内線');
    line = line.replace(/近江鉄道.*/, '近江鉄道線');
    line = line.replace('長良川鉄道', '長良川鉄道越美南線');
    line = line.replace(/阪堺電気軌道.*/, '阪堺電気軌道線');
    line = line.replace(/鹿児島市電.*/, '鹿児島市電');

    if (line == '信越本線・篠ノ井線') {
      return_lines.push('信越本線');
      return_lines.push('篠ノ井線');
    }

    if (line == '東京メトロ有楽町線・副都心線') {
      return_lines.push('東京メトロ有楽町線');
      return_lines.push('東京メトロ副都心線');
    }

    switch (line) {
      case 'スカイレールサービス':
      case '京阪男山ケーブル':
      case '近鉄生駒ケーブル':
      case '近鉄西信貴ケーブル':
      case '南海高野山ケーブル':
      case '御岳登山鉄道御岳山ケーブル':
      case '比叡山鉄道坂本ケーブル':
      case '嵯峨野観光鉄道':
      case '平成筑豊鉄道門司港レトロ観光線':
      case '箱根ロープウェイ':
      case '箱根登山ケーブル':
      case '高尾登山電鉄高尾登山ケーブル':
      case '黒部峡谷鉄道':
      case '宇都宮線・高崎線':
      case '信越本線・篠ノ井線':
      case '東京メトロ有楽町線・副都心線':
        line = '';
        break;
    }

    if (line != '') {
      return_lines.push(line);
    }
  }

  return_lines = Array.from(new Set(return_lines));

  return return_lines;
}

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
        yield sleep(5000);
      }
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
