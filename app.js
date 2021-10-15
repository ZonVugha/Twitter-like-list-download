
const dotenv = require('dotenv');
const Twitter = require('twitter');

dotenv.config({ path: './config.env' });

const twitterClient = new Twitter({
  consumer_key: process.env.API_KEY,
  consumer_secret: process.env.API_KEY_SECRET,
  bearer_token: process.env.BEARER_TOKEN,
});

twitterClient.get('https://api.twitter.com/2/users/YOUTWITTERID/liked_tweets?max_results=5', (error, tweets, response) => {
  if (error) throw new Error(error);
  console.log(tweets.data);
  console.log(tweets.meta);
})
twitterClient.get('https://api.twitter.com/2/tweets?ids=TWEETSID&expansions=attachments.media_keys&media.fields=duration_ms,height,media_key,preview_image_url,public_metrics,type,url,width,alt_text'
  , (err, tweets, res) => {
    // console.log(res.body);
    console.log(res.body);
  })