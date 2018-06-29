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
  let is_length_filter = 1, length_done = [0];
  let arr_holder = [], arr_holder_searched = [];
  let e_holder = [];
  console.log(req.body.lowtime);

  date_filter(req).then(function(){
    return search_term_filter(req);
  }).then(function(){
    return send_request(req, res, arr_holder);
  }).then(function(page_num){
    return length_filter(req, res, arr_holder, page_num, e_holder, length_done);
  }).then(function(page_num){
    console.log("BOOL: " + length_done[0]);
    return eliminate_results(arr_holder, page_num, e_holder);
  }).then(function(page_num){
    if(is_length_filter == 1){
      console.log("BOOL: " + length_done[0]);
      return render_page(res, arr_holder, page_num); //render length filtered results
    }
    else{
      return render_page(res, arr_holder, page_num); //render normal 
    }
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

let send_request = function(req, res, arr_holder){
  return new Promise(function(resolve,reject){
    let search_number = 9; //amount of videos to be pulled  
    let parameters = { 
      publishedBefore: localStorage.getItem('high_date'), 
      publishedAfter: localStorage.getItem('low_date'), 
      pageToken: localStorage.getItem('page_token')
    };

    tube.search(search_term, search_number, parameters, function(error, result, body){
      let is_error = 0;
      
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
            video_url,
            result.items[i].id.videoId
          );
          //console.log(result.items[i]);
          arr_holder.push(video_class); //array of videos
        }
        page_token = result.nextPageToken;
      }
      localStorage.setItem('page_token', page_token);

      resolve(page_num);  
    });
  });
};

/*Work in progress*/
let length_filter = function(req, res, arr_holder, page_num, e_holder, length_done){
  return new Promise(function(resolve,reject){
    let isLength = 1;
    let high_filter = "PT2M22S"; //2 minutes, 22 seconds (test data)
    let high_min = "2";
    let high_sec = "22";

    if(isLength == 1){ //modify arr_holder
      
      let async_counter = 0;
      let length_arr_holder = arr_holder.length;

      let filter_done = 0;
      while(filter_done == 0){
        filter_done = 1;
        for(let i = 0; i < length_arr_holder; i++){
          
          tube.getById(arr_holder[i].id, function(error, result2){ 

            try{
              console.log(result2.items[0].contentDetails.duration);
              let time_string = result2.items[0].contentDetails.duration;
              let time_string_min = "", time_string_sec = "";
              let isMin = 0;
              for(let v = 2; v < time_string.length - 1; v++){ 

                if(time_string.charAt(v) === "M"){

                  if(time_string_min <= high_min && e_holder.length < 9){
                    e_holder.push(arr_holder[i]);
                  }
                  break;
                }
                  time_string_min = time_string_min + time_string.charAt(v);

              }
              
            }
            catch(error){
              console.log(error + ", Probably not a video.");
            }
            
            async_counter++;
            if(async_counter == length_arr_holder){
              let e_size = e_holder.length;
            console.log("Before: " + e_size);
              if(e_size < 9){
                console.log("FINAL: " + e_size);
                length_done[0] = 0;
                resolve(page_num); 
              }
              else{
                console.log("DONE ESIZE: " + e_size );
                length_done[0] = 1;
                resolve(page_num);
              }
            }
          });
        }
      }  
    }
    else{ //no filter so leave it be
      length_done[0] = 1;
      resolve(page_num);
    }

  });
};

let eliminate_results = function(arr_holder, page_num, e_holder){
  return new Promise(function(resolve,reject){
    console.log("e_size: " + e_holder.length);
    for(var i = 0; i < e_holder.length; i++){
      console.log(e_holder[i].id);
    }

    resolve(page_num);
  });
};

let render_page = function(res, holder, page_num){
  return new Promise(function(resolve,reject){
    console.log("HOLDER:" + holder.length);
    res.render('index', {error: null, 
      video_array: holder,
      page_num: page_num}); 
    resolve();
  });
};