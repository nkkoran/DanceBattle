const posenet = require('@tensorflow-models/posenet');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var router = express.Router();


app.use(express.static('public'));
//app.engine('html', require('ejs').renderFile);

app.get('/', function(req, res) {
  res.render('index2.html');
});

app.get('/ui', function(req, res) {
  res.render('index.html');
});

app.get('/algo', function(req, res) {
  res.render('index2.html');
});

app.listen(3000);