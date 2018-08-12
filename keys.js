require('dotenv').config();

module.exports.twitterObj = {
   consumer_key: process.env.TWITTER_CONSUMER_KEY,
   consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
   access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
   access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
 };
 
 module.exports.spotifyObj = {
   id: process.env.SPOTIFY_ID,
   secret: process.env.SPOTIFY_SECRET
 };

 module.exports.omdbKey = process.env.OMDB_KEY