
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

let photoUrl = '';
let fileName = '';
twitterClient.get(`https://api.twitter.com/2/users/by/username/${config.username}`, (err, users, res) => {
  getTweets(users.data.id);
})

const getTweets = (username) => {
  twitterClient.get(`https://api.twitter.com/2/users/${username}/liked_tweets?max_results=${config.maxfile}`, (error, tweets, response) => {
    if (error) throw new Error(error);
    for (let index = 0; index < tweets.data.length; index++) {
      getPhoto(tweets.data[index].id);
    }
  })
}
const getPhoto = (tweetsID) => {
  twitterClient.get(`https://api.twitter.com/2/tweets?ids=${tweetsID}&expansions=attachments.media_keys&media.fields=duration_ms,height,media_key,preview_image_url,public_metrics,type,url,width,alt_text`
    , (err, tweets, res) => {
      if (tweets.includes) {
        for (let index = 0; index < tweets.includes.media.length; index++) {
          if (tweets.includes.media[index].type == 'photo') {
            photoUrl = tweets.includes.media[index].url;
            fileName = photoUrl.substring(photoUrl.lastIndexOf('/') + 1);
            download(photoUrl, fileName, (filename) => {
              console.log(`${filename}`);
            });
          } else if (tweets.includes.media[0].type == 'video') {
            photoUrl = tweets.includes.media[0].preview_image_url;
            fileName = "videoIMG " + photoUrl.substring(photoUrl.lastIndexOf('/') + 1);
            download(photoUrl, fileName, (filename) => {
              console.log(`${filename}`);
            });
          }
        }
      } else {
        console.log('have not media');
      }
    })
}

const download = function (downloadUrl, filename, cb) {
  const file = fs.createWriteStream(path.join(config.filepath,filename));
  client.get(downloadUrl, (res) => {
    res.pipe(file.on('finish', () => {
      file.close(cb(filename));
    }));
  })
}
