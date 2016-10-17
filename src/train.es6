import client from 'cheerio-httpcli';
import co from 'co';

import utils from './utils';

import stationListUrl from '../files/stationListUrl.json';
import trainInfoUrl from '../files/trainInfoUrl.json';

export default class Train {
  constructor() {
  }

  /**
   * 駅名から路線名に変換する関数.
   *
   * @param string name
   * @returns {*}
   */
  findStationNameToLineName(name) {
    let keys = {};
    let check_name;

    name = name.trim();
    name = name.replace(/\(/g, '\\(');
    name = name.replace(/\)/g, '\\)');
    
    if (name.slice(-1) == "!" || name.slice(-1) == "！") {
      check_name = new RegExp('^' + name.replace('!', '').replace('！', '') + '$');
    } else {
      check_name = new RegExp('.*' + name + '.*');
    }

    let lineList = Object.keys(stationListUrl);
    for (let i = 0; i < lineList.length; i++) {
      const station_name = lineList[i];
      if (station_name.match(check_name)) {
        keys[station_name] = stationListUrl[station_name].lines;
      }
    }

    return keys;
  }

  /**
   * 路線名から路線情報のURLに変換する関数.
   *
   * @param string name 路線名
   * @returns {*}
   */
  findLineNameToUrl(name) {
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

  getTrainInfoAtStation(name) {
    const train = new Train();
    co(function*() {
      let stationLines = train.findStationNameToLineName(name);
      let tInf = [];
      for (let station in stationLines) {
        const lines = stationLines[station];
        for (let i = 0; i < lines.length; i++) {
          const lineUrls = train.findLineNameToUrl(lines[i]);
          for (let j = 0; j < lineUrls.length; j++) {
            const $ = yield  utils.getData(lineUrls[j].url);

            const trainInfo = $('#mdServiceStatus dt').text();
            const replaceStr = $('#mdServiceStatus dt span').text();
            let status = trainInfo.replace(replaceStr, '').replace(/\n/g, '');
            let trouble = $('#mdServiceStatus .trouble').text().replace(/\n/g, '');

            tInf.push({
              'station_name': station,
              'line_name': lineUrls[j].name,
              'status': status,
              'trouble': trouble,
            });
          }
        }
      }
      console.log(tInf);
      return tInf;
    });
  }

  getTrainInfoAtLine(name) {
    let nameUrls = this.findLineNameToUrl(name);
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
          'station_name': '',
          'line_name': nameUrls[i].name,
          'status': status,
          'trouble': trouble,
        });
      }
      return tInf;
    });
  }
}
