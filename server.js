const express = require('express')
const app = express()

app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  //res.send('Hello World!') // to client
  res.render("index"); // sent to index.ejs
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
