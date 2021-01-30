const posenet = require('@tensorflow-models/posenet');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var router = express.Router();

app.use(express.static(__dirname));

app.get('/', function(req, res) {
  res.render('index.html');
});

app.get('/stand.png', function(req, res) {
  res.render('stand.jpg');
});

app.listen(3000);