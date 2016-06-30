import {expect} from 'chai';
import co from 'co';
import client from 'cheerio-httpcli';
import trainInfoUrl from '../trainInfoUrl.json';

describe('trainInfoUrlList', () => {
  it ('checkTrainInfoUrl', function(done) {
    this.timeout(10 * 1000);
    co(function* () {
      let lineArray = [];
      for (let line in trainInfoUrl) {
        lineArray.push(trainInfoUrl[line]);
      }

      let checkLine = [];
      for (let i = 0; i < 10; i++) {
        const rand = Math.floor(Math.random() * lineArray.length);
        checkLine.push(client.fetch(lineArray[rand]));
        lineArray.splice(rand, 1);
      }

      let results = yield checkLine;
      results.forEach(function(result) {
        // console.log(result.$('title').text());
        const statusCode = result.response.statusCode;
        expect(statusCode).to.equal(200);
      });
    })
    .then(done, done);
  });
});
