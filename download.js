// Open Chrome
// Go here: https://<workspace>.slack.com/customize/emoji
// Inspect network traffic via Dev Tools -> Network tab
// Locate response's emojis array from payload of request that looks like:
//   https://<workspace>.slack.com/api/emoji.adminList?_x_id=...
// Right click emojies and select "Copy to local variable" (temp1)
// In the console, run: copy(temp1)
// Paste in local file: emojis.json

const https = require('https');
const fs = require('fs');
const path = require('path');
const rawEmojis = require('./emoji.json');

const download = (url, dest) =>
  new Promise(resolve => {
    const file = fs.createWriteStream(dest);

    https.get(url, response => {
      response.pipe(file);

      file.on('finish', function() {
        file.close(resolve);
      });
    });
  });

const dir = path.join(__dirname, 'output');

if (!fs.existsSync(dir)) fs.mkdirSync(dir);

const extensionFromUrl = url =>
  url
    .split('/')
    .slice(-1)[0]
    .split('.')
    .slice(-1)[0];

const emojis = rawEmojis.reduce((acc, emoji) => {
  acc = [...acc, emoji];

  if (emoji.synonyms) {
    acc = [...acc, ...emoji.synonyms.map(name => ({ ...emoji, name }))];
  }

  return acc;
}, []);

const downloadEmoji = ({ name, url }) => {
  download(url, path.join(dir, `${name}.${extensionFromUrl(url)}`));
};

const promises = emojis.map(downloadEmoji);

Promise.all(promises);
