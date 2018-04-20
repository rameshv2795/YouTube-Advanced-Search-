//import { Youtube } from 'googleapis/build/src/apis/youtube/v3';

const express = require('express')
const app = express()
const Video = require('./video.js'); //include video.js class
const bodyParser = require('body-parser');
const request = require('request');
const YouTube = require('youtube-node');
let youtube_key = "AIzaSyA-l5_2YCDQ-m0PCm8BoLOGI8vOXWn8ve8";

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
/*Import video.js file*/



var tube = new YouTube();
tube.setKey(youtube_key);

/*const youtube = google.youtube({
  version: 'v3',
  auth: youtube_key
});*/



app.get('/', function (req, res) {
  //res.send('Hello World!') // to client
  res.render("index"); // sent to index.ejs
})

app.post('/', function(req, res) {
   // res.render('index');
   // console.log(req.body.city);
    //let city = req.body.city;
    //let key = "cffe188ce6339bc2c99d33e270fff166";
    
    //let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${key}`
   // let currency_url = ;
    /*
    request(url, function (err, response, body) {
      if(err){
        res.render('index', {weather: null, error: 'Error, please try again'});
      } else {
        let weather = JSON.parse(body)
        if(weather.main == undefined){
          //res.render('index', {weather: null, error: 'Error, please try again'});
        } else {
          let weatherText = `It's ${weather.main.temp} degrees in ${weather.name}!`;
          //res.render('index', {weather: weatherText, error: null});
        }
      }
    });
    */
    //request(url_youtube, function (err, response, body) {
      //console.log("AM I HERE?");
      /*if(err){
        //res.render('index', {weather: null, error: 'Error, please try again'});
      } else {
        let vid = JSON.parse(body)
        if(vid == "h"){
          console.log("SHOULDNT BE HERE");
          //res.render('index', {weather: null, error: 'Error, please try again'});
        } else {
          var output = vid.pageInfo.totalResults;
          console.log("SHOULDNT BE HERE");
          res.render('index', {vid: output, error: null});*/
         
     /* youtube.search.list({
        part: 'snippet',
        q: 'bears'
      }, function (err, data) {
        if (err) {
          console.error('Error: ' + err);
        }
        if (data) {
          //var vid = JSON.parse(data);
          var vid = data;
          console.log(data);
        }
      }); */
  let search_term = req.body.video_keyword; //user input search
  var search_number = 5; //amount of videos to be pulled  
  var arr_holder = []; //stores all videos returned from search
  tube.search(search_term,search_number,function(error, result, body){
    if(error){
      console.log("ERROR");
    }
    else{
      var string_result = "";

      for(var i = 0; i < search_number; i++){ 
        //console.log(result.items[i].snippet.title);
        
        var video_class = new Video(
          result.items[i].snippet.title,
          result.items[i].snippet.thumbnails.medium.url);
        arr_holder.push(video_class); //array of videos
      }
      console.log(arr_holder[1].pic);
      res.render('index', {error: null, 
        video_array: arr_holder});
      //console.log(result.items[0].snippet.title);
      
    }
  });
});           


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})



