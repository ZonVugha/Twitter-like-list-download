
const dotenv = require('dotenv');
const Twitter = require('twitter');
const client = require('https');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
dotenv.config({ path: './config.env' });

const twitterClient = new Twitter({
  consumer_key: process.env.API_KEY,
  consumer_secret: process.env.API_KEY_SECRET,
  bearer_token: process.env.BEARER_TOKEN,
});

let maxNum = 0;
let photoUrl = '';
let fileName = '';
twitterClient.get(`https://api.twitter.com/2/users/YOUTWITTERID/liked_tweets?max_results=${config.maxfile}`, (error, tweets, response) => {
  if (error) throw new Error(error);
  // console.log(tweets.data);
  maxNum = tweets.data.length;
  for (let index = 0; index < tweets.data.length; index++) {
    getPhoto(tweets.data[index].id);
  }
})
const getPhoto = (tweetsID) => {
  twitterClient.get(`https://api.twitter.com/2/tweets?ids=${tweetsID}&expansions=attachments.media_keys&media.fields=duration_ms,height,media_key,preview_image_url,public_metrics,type,url,width,alt_text`
    , (err, tweets, res) => {
      // console.log(tweets.includes.media);
      try {
        for (let index = 0; index < tweets.includes.media.length; index++) {
          if (tweets.includes.media[index].type == 'photo') {
            photoUrl = tweets.includes.media[index].url;
            fileName = photoUrl.substring(photoUrl.lastIndexOf('/') + 1);
            download(photoUrl, fileName);
          } else if (tweets.includes.media[0].type == 'video') {
            photoUrl = tweets.includes.media[0].preview_image_url;
            fileName = "videoIMG " + photoUrl.substring(photoUrl.lastIndexOf('/') + 1);
            download(photoUrl, fileName);
          }
        }

      } catch (error) {
        console.log(error);
        console.log("have not media");
      }
    })
}


const download = function (downloadUrl, filename) {
  client.get(downloadUrl, async (res) => {
    res.pipe(fs.createWriteStream(filename).on('close', () => {
      moveFile(filename);
    }));
  })
}

const moveFile = (filename) => {
  fs.readFile(path.join(__dirname, filename), (err, data) => {
    if (err) throw err;
    fs.writeFile(path.join(config.filepath, filename), data, (err) => {
      if (err) throw err;
    })
  })
  fs.unlink(path.join(__dirname, filename), (err) => {
    if (err) throw err;
  })
}
