import fs from 'fs';
import co from 'co';

const stationListFile = __dirname + '/../files/stationListUrl.json';
const lineListFile = __dirname + '/../files/trainInfoUrl.json';

co(function* () {
  const stationList = JSON.parse(fs.readFileSync(stationListFile));
  const lineList = JSON.parse(fs.readFileSync(lineListFile));

  // 駅リストより路線情報を取り出す.
  let stationLine = [];
  for (let station in stationList) {
    stationList[station].lines.forEach(line => {
      stationLine.push(line);
    });
  }
  stationLine = Array.from(new Set(stationLine)).sort();

  // 路線リストより路線情報を取り出す.
  let lineLine = Object.keys(lineList);
  for (let i = 0; i < lineLine.length; i++) {
    lineLine[i] = lineLine[i].replace(/\[.*\]/g, '');
  }

  // 駅リストにあるが、路線リストにない路線をピックアップ.
  for (let index in stationLine) {
    let line = stationLine[index];

    if (!lineLine.includes(line)) {
      console.log(line);
    }
  }

});