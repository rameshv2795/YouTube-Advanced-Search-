const request = require('request');

let key = "cffe188ce6339bc2c99d33e270fff166";
let city = "Cairo";
let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=imperial`;

request(url,function(err,response,body){ //function to run when request goes
    let weather = JSON.parse(body);
    if(err){
        console.log('error:',error);
    }
    else{
       // console.log('body:',body);
        
        console.log(`${weather.name}: ${weather.main.temp}F`);
        res.render('index', {weather: `${weather.name}: ${weather.main.temp}F`, error: null});
    }
});

