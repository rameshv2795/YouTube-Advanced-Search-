//import { Youtube } from 'googleapis/build/src/apis/youtube/v3';

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
/*Import video.js file*/


//var search_term; //global variable (might need to change)
var page_num = 1;
var tube = new YouTube();
tube.setKey(youtube_key);

/*const youtube = google.youtube({
  version: 'v3',
  auth: youtube_key
});*/



app.get('/', function (req, res) {
  res.render("index"); // sent to index.ejs
})

app.post('/', function(req, res) {
  var search_term = "";
  var low_date;
  var high_date;
  var search_number = 9; //amount of videos to be pulled  
  var page_token, marker = 0, counter = 0;
  var arr_holder = [];

  if(req.body.pageform === undefined){
    search_term = req.body.video_keyword; //user input search
    page_num = 1;
    localStorage.setItem('page_token', '');
  }
  else{
    search_term = req.body.search_hid; //from inviz form (prevents using global var)
    console.log(search_term);
    page_num++;
    //render_after(localStorage.getItem('arr_holder'), res);
  }  

    
  tube.search(search_term,search_number, {pageToken: localStorage.getItem('page_token')},function(error, result, body){
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
        //console.log(result.items[i].snippet.title);
        var video_url = "https://www.youtube.com/watch?v=" + result.items[i].id.videoId;
        console.log(result.items[i].snippet.publishedAt);
        var video_class = new Video(
          result.items[i].snippet.title,
          result.items[i].snippet.thumbnails.medium.url,
          video_url);
        arr_holder.push(video_class); //array of videos
      }
      page_token = result.nextPageToken;
      //console.log(arr_holder[1].pic);
      //so can load page
      //console.log(result.items[0].snippet.title);  
    }
    
   console.log(page_token);
    localStorage.setItem('page_token', page_token);
    //localStorage.setItem('arr_holder', arr_holder);
    render_after(arr_holder,res);
    
  });
    
      
  


});           


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

function render_after(arr_holder, res){
  res.render('index', {error: null, 
    video_array: arr_holder,
    page_num: page_num,
    JSDOM: JSDOM});  
}

