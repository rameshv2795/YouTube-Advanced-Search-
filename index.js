const request = require('request');

let key = "cffe188ce6339bc2c99d33e270fff166";
let city = "Cairo";
let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=imperial`;

request(url,function(err,response,body){ //function to run when request goes
    if(err){
        console.log('error:',error);
    }
    else{
       // console.log('body:',body);
        let weather = JSON.parse(body);
        console.log(`${weather.name}: ${weather.main.temp}F`);
    }
});

