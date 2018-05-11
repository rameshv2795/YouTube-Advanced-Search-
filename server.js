const express = require('express');
const app = express();
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const Video = require('./video.js'); //include video.js class
const bodyParser = require('body-parser');
const request = require('request');
const YouTube = require('youtube-node');
let youtube_key = "AIzaSyA-l5_2YCDQ-m0PCm8BoLOGI8vOXWn8ve8";

if(typeof localStorage === "undefined" || localStorage === null){
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


var page_num = 1; //global variable (need to change to local storage or cookie)
var tube = new YouTube();
tube.setKey(youtube_key);

app.get('/', function (req, res) {
  res.render("index"); // sent to index.ejs
})

app.post('/', function(req, res) {
  var search_term = "";
  var low_date = "2000-05-10T19:00:03.000Z", high_date = "2900-05-10T19:00:03.000Z";
  var search_number = 9; //amount of videos to be pulled  
  var page_token, marker = 0, counter = 0;
  var arr_holder = [];

  /*When user first opens page*/
  if(localStorage.getItem('low_date') === null){
    localStorage.setItem('low_date', low_date);
    localStorage.setItem('high_date', high_date);
  }

  /*Date filter information*/
  if(req.body.lowdate !== "" && req.body.lowdate !== undefined){
    low_date = new Date(req.body.lowdate);
    low_date = low_date.toISOString();
    localStorage.setItem('low_date', low_date);
  }
  if(req.body.highdate !== "" && req.body.highdate !== undefined){
    high_date = new Date(req.body.highdate);    
    high_date = high_date.toISOString();
    localStorage.setItem('high_date', high_date);
  }
  if(req.body.pageform === undefined){
    console.log("ISO DATE: " + low_date);
    search_term = req.body.video_keyword; //user input search
    page_num = 1;
    localStorage.setItem('page_token', ''); //reset page token if new search
  }
  else{
    search_term = req.body.search_hid; //from inviz form (prevents using global var)
    console.log(search_term);
    page_num++;
  }  

  tube.search(search_term, search_number, {publishedBefore: localStorage.getItem('high_date'), publishedAfter: localStorage.getItem('low_date'), pageToken: localStorage.getItem('page_token')}, function(error, result, body){
    //stores all videos returned from search
    var is_error = 0;

    if(error){
      is_error = 1;
      console.log("ERROR");
    }
    else{
      var string_result = "";
      is_error = 0;

      for(var i = 0; i < search_number; i++){ 
        var video_url = "https://www.youtube.com/watch?v=" + result.items[i].id.videoId;
        console.log(result.items[i].snippet.publishedAt);
        var video_class = new Video(
          result.items[i].snippet.title,
          result.items[i].snippet.thumbnails.medium.url,
          video_url);
        arr_holder.push(video_class); //array of videos
      }
      page_token = result.nextPageToken;
    }
   
    localStorage.setItem('page_token', page_token);
    //localStorage.setItem('arr_holder', arr_holder);
    render_after(arr_holder,res);
  });

});           

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});

function render_after(arr_holder, res){
  res.render('index', {error: null, 
    video_array: arr_holder,
    page_num: page_num,
    JSDOM: JSDOM});  
}

