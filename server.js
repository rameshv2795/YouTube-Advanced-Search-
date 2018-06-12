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
  let LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

let page_num = 1; //global variable (need to change to local storage or cookie)
let tube = new YouTube();
tube.setKey(youtube_key);

app.get('/', function (req, res){
  res.render("index"); // sent to index.ejs
})

app.post('/', function(req, res){
  let search_term = "";
  let page_token, marker = 0, counter = 0; //Global vars in this scope. Might need to change
  let is_length_filter = 1;
  console.log(req.body.lowtime);
  date_filter(req).then(function(){
    return search_term_filter(req);
  }).then(function(){
    return send_request(req,res);
  }).then(function(arr_holder, page_num){
    return render_page(res, arr_holder, page_num);
  });

});           

app.listen(3000, function(){
  console.log('Example app listening on port 3000!')
});

/*Promises for setting api date parameter*/
let date_filter = function(req){
  return new Promise(function(resolve,reject){
    let low_date = "2000-05-10T19:00:03.000Z", high_date = "2900-05-10T19:00:03.000Z";

    if(localStorage.getItem('low_date') === null){ //no local storage set yet
      localStorage.setItem('low_date', low_date);
      localStorage.setItem('high_date', high_date);
    }
    if(req.body.lowdate === ""){ //low date filter empty
      localStorage.setItem('low_date', low_date); //set default 
    }
    if(req.body.highdate === ""){ //higher date filter empty
      localStorage.setItem('high_date', high_date); //set default 
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

    resolve();
  });
};

let search_term_filter = function(req){
  return new Promise(function(resolve,reject){
    if(req.body.pageform === undefined){
      //console.log("ISO DATE: " + low_date);
      search_term = req.body.video_keyword; //user input search
      page_num = 1;
      localStorage.setItem('page_token', ''); //reset page token if new search
    }
    else{
      search_term = req.body.search_hid; //from inviz form (prevents using global var)
      console.log(search_term);
      page_num++;
    }  

    resolve(search_term);
  });
};

let send_request = function(req,res){
  return new Promise(function(resolve,reject){
    let search_number = 9; //amount of videos to be pulled  
    let parameters = { 
      publishedBefore: localStorage.getItem('high_date'), 
      publishedAfter: localStorage.getItem('low_date'), 
      pageToken: localStorage.getItem('page_token')
    };

    tube.search(search_term, search_number, parameters, function(error, result, body){
      let is_error = 0;
      let arr_holder = [];
      
      if(error){
        is_error = 1;
        console.log("ERROR");
      }
      else{
        let string_result = "";
        is_error = 0;
  
        for(let i = 0; i < search_number; i++){ 
          let video_url = "https://www.youtube.com/watch?v=" + result.items[i].id.videoId;
          let video_class = new Video(
            result.items[i].snippet.title,
            result.items[i].snippet.thumbnails.medium.url,
            video_url);
          //console.log(result.items[i]);
          arr_holder.push(video_class); //array of videos
        }
        tube.getById(result.items[1].id.videoId, function(error, result2){
          console.log(result2.items[0].contentDetails);
        });
        page_token = result.nextPageToken;
      }
      localStorage.setItem('page_token', page_token);

      resolve(arr_holder, page_num);  
    });
  });
};

let render_page = function(res, arr_holder, page_num){
  return new Promise(function(resolve,reject){
    res.render('index', {error: null, 
      video_array: arr_holder,
      page_num: page_num}); 
    resolve();
  });
};