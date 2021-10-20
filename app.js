
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
let maxTweetsCount = 0;
let url = ''
const startRun = () => {
  twitterClient.get(`https://api.twitter.com/2/users/by/username/${config.username}`, (err, users, res) => {
    getTweets(users.data.id);
    url = '';
    url = `https://api.twitter.com/2/users/${users.data.id}/liked_tweets`
    // howManyTweets(url);
  })
}

const getTweets = (username) => {
  twitterClient.get(`https://api.twitter.com/2/users/${username}/liked_tweets?max_results=${config.maxfile}`, (error, tweets, response) => {
    if (error) throw new Error(error);
    for (let index = 0; index < tweets.data.length; index++) {
      getPhoto(tweets.data[index].id);
    }
  })
}

const howManyTweets = (url) => {
  twitterClient.get(url, (error, tweets, response) => {
    if (error) throw new Error(error);
    if (tweets.meta.result_count !== 0) {
      maxTweetsCount += tweets.meta.result_count;
      url = url.substring(0, url.lastIndexOf('?') == -1 ? url.length : url.lastIndexOf('?'));
      for (let index = 0; index < tweets.data.length; index++) {
        getPhoto(tweets.data[index].id);
      }
      url += `?pagination_token=${tweets.meta.next_token}`
      console.log(url);
      console.log(downloadUrlArr.length);
      howManyTweets(url);
    } else {
      console.log(maxTweetsCount);
    }
  })
}
const getPhoto = (tweetsID) => {
  twitterClient.get(`https://api.twitter.com/2/tweets?ids=${tweetsID}&expansions=attachments.media_keys&media.fields=duration_ms,height,media_key,preview_image_url,public_metrics,type,url,width,alt_text`
    , (err, tweets, res) => {
      try {
        if (typeof tweets.includes !== 'undefined') {
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
            } else if (tweets.includes.media[0].type == 'animated_gif') {
              photoUrl = tweets.includes.media[0].preview_image_url;
              fileName = "gifIMG " + photoUrl.substring(photoUrl.lastIndexOf('/') + 1);
              download(photoUrl, fileName, (filename) => {
                console.log(`${filename}`);
              });
            }
          }
        } else {
          console.log('have not media');
        }
      } catch (error) {
        if (error) {
          console.log(error);
          startRun();
        }
      }

    })
}

const download = function (downloadUrl, filename, cb) {
  const file = fs.createWriteStream(path.join(config.filepath, filename), { encoding: 'base64' });
  client.get(downloadUrl, (res) => {
    res.pipe(file);
    file.on('finish', () => {
      file.close(cb(filename));
    })
    file.on('error', (err) => {
      fs.unlink(path.join(config.filepath, filename), () => console.log(err));
    })
  })
}
startRun();