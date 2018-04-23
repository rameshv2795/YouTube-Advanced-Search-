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
  //res.send('Hello World!') // to client
  res.render("index"); // sent to index.ejs
})

app.post('/', function(req, res) {

  var search_term = "";

  if(req.body.pageform === undefined){
    search_term = req.body.video_keyword; //user input search
    page_num = 1;
  }
  else{
    search_term = req.body.search_hid; //from inviz form (prevents using global var)
    console.log(search_term);
    page_num++;
  }
  var search_number = 50; //amount of videos to be pulled  
  var arr_holder = []; //stores all videos returned from search
  console.log(page_num);
  tube.search(search_term,search_number,function(error, result, body){
    if(error){
      console.log("ERROR");
    }
    else{
      var string_result = "";

      for(var i = 0; i < search_number; i++){ 
        //console.log(result.items[i].snippet.title);
        var video_url = "https://www.youtube.com/watch?v=" + result.items[i].id.videoId;
        
        var video_class = new Video(
          result.items[i].snippet.title,
          result.items[i].snippet.thumbnails.medium.url,
          video_url);
        arr_holder.push(video_class); //array of videos
      }
      //console.log(arr_holder[1].pic);
      //so can load page
      res.render('index', {error: null, 
        video_array: arr_holder,
        page_num: page_num,
        JSDOM: JSDOM});
      //console.log(result.items[0].snippet.title);
    
    }
  });
});           


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})



