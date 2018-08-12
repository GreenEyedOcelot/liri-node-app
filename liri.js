// need to include a bunch of stuff for this to work
var {
   twitterObj,
   spotifyObj,
   omdbKey
} = require('./keys.js');

var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var fs = require('fs');
var request = require('request');
const DEFAULT_SONG = "The Sign";
const DEFAULT_FILM = "Mr. Nobody";
const NONE_GIVEN = "[none given]";

// read command-line arguments
processCommand(process.argv);

function processCommand(argv) {
   var operation = argv[2];
   var params = argv.slice(3).join(" ")

   //switch case
   switch (operation) {
      case "my-tweets":
         showMyTweets();
         break;

      case "spotify-this-song":
         if (params) {
            showSongInformation(params);
         } else {
            showSongInformation(DEFAULT_SONG);
         }
         break;

      case "movie-this":
         if (params) {
            showFilmInformation(params)
         } else {
            showFilmInformation(DEFAULT_FILM);
         }
         break;

      case "do-what-it-says":
         doWhatFileSays();
         break;

      default:
         console.log("\nSorry, I cannot recognize that command!");
         console.log("I am not a very smart bot right now. I only know these four commands:");
         console.log("  * \"my-tweets\" - shows the last 20 tweets using Twitter API");
         console.log("  * \"spotify-this-song\" - shows information for a spotify song using Spotify API");
         console.log("  * \"movie-this\" - shows some film information using omdb API");
         console.log("  * \"do-what-it-says\" - reads the instructions from a file and does what it says\n");
         break;
   }

   function showSongInformation(song) {
      var spotify = new Spotify(spotifyObj);

      spotify
         .search({
            type: 'track',
            query: song
         })
         .then(function (response) {
            var filterFn = (item) => item.name.toLowerCase() === song.toLowerCase();
            var tracksArray = response.tracks.items.filter(filterFn);
            var songStrArr = [];
            songStrArr.push("\nFound " + tracksArray.length + " song(s) on spotify with that title. Here they are:\n")

            tracksArray.forEach(function (trackObj) {
               var title = trackObj.name;
               var artists = trackObj.artists.map((obj) => obj.name).join(", ");
               var previewLink = (trackObj.preview_url) ? trackObj.preview_url : NONE_GIVEN;
               var album = trackObj.album.name;
               songStrArr.push("------------------------------------SONG INFORMATION------------------------------------");
               songStrArr.push("Song name: " + title);
               songStrArr.push("Artists: " + artists);
               songStrArr.push("Preview Link: " + previewLink);
               songStrArr.push("Album: " + album)
            })

            console.log(songStrArr.join("\n"));

         })
         .catch(function (err) {
            console.log(err);
         });


   }

   function showFilmInformation(filmName) {

      var url = `http://www.omdbapi.com/?apikey=${omdbKey}&t=${filmName}`;

      request(url, function (error, response, body) {

         if (response && response.statusCode && response.statusCode === 200) {
            var filmData = "";
            var data = JSON.parse(body);

            if (data.Response === "True") {
               var filterFn = (obj) => obj.Source === "Internet Movie Database" || obj.Source === "Rotten Tomatoes";
               var formatFn = (obj) => obj.Source + " - " + obj.Value;
               var getValue = (val) => val ? val : NONE_GIVEN;
               var theRatings = data.Ratings.filter(filterFn).map(formatFn).join(",  ");

               filmData = `\n------------------------------------FILM INFORMATION------------------------------------\n`;
               filmData += `Title: ${getValue(data.Title)} (${getValue(data.Year)})\n`;
               filmData += `Country: ${getValue(data.Country)},  Language: ${getValue(data.Language)}\n`;
               filmData += `Ratings: ${theRatings}\n`;
               filmData += `Actors: ${getValue(data.Actors)}\nPlot: ${getValue(data.Plot)}\n`;
            } else {
               filmData = data.Error;
            }
         }

         console.log(filmData);
      });


   }

   function showMyTweets() {
      var client = new Twitter(twitterObj);

      client.get("statuses/user_timeline", {
         screen_name: "HazelEyedOcelot"
      }, function (error, tweets, response) {
         if (!error && response && response.statusCode && response.statusCode == 200) {
            var tweets = tweets.map((tweet) => tweet.created_at + " : " + tweet.text).join("\n");
            console.log(tweets);
         } else if (error) {
            console.log("ERROR: ", error);
         }
      })
   }



   function doWhatFileSays() {
      fs.readFile("random.txt", "utf-8", function (error, data) {
         var dataArr = data.split(/[,"]/);
         var stripSpaceFn = (item) => item.trim();
         var removeEmptyStringsFn = (item) => {
            return (item) ? true : false
         };

         dataArr = dataArr.map(stripSpaceFn).filter(removeEmptyStringsFn);
         dataArr.unshift("dummyValue1", "dummyValue2");
         processCommand(dataArr);
      });
   }
}