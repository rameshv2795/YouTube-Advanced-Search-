const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const request = require('request');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')


app.get('/', function (req, res) {
  //res.send('Hello World!') // to client
  res.render("index"); // sent to index.ejs
})

app.post('/', function(req, res) {
   // res.render('index');
   // console.log(req.body.city);
    let city = req.body.city;
    let key = "cffe188ce6339bc2c99d33e270fff166";
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${key}`
  
    request(url, function (err, response, body) {
      if(err){
        res.render('index', {weather: null, error: 'Error, please try again'});
      } else {
        let weather = JSON.parse(body)
        if(weather.main == undefined){
          res.render('index', {weather: null, error: 'Error, please try again'});
        } else {
          let weatherText = `It's ${weather.main.temp} degrees in ${weather.name}!`;
          res.render('index', {weather: weatherText, error: null});
        }
      }
    });
        
  })

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})



