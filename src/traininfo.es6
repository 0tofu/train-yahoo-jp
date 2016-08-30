import client from 'cheerio-httpcli';
import co from 'co';
import in_file from '../files/trainInfoUrl.json';

const train_url = in_file['阪急京都本線'];

console.log(train_url);

client.fetch(train_url)
.then(function(result) {
  var $ = result.$;

  var hoge = $('#mdServiceStatus dt').text();
  var hogehoge = $('#mdServiceStatus dt span').text();
  console.log(hoge.replace(hogehoge, ''));
});
//console.log(result);
