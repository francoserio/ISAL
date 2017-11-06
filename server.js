var http = require('http');
var express = require('express');
var validUrl = require('valid-url');
var favicon = require('serve-favicon');
var mongo = require('mongodb').MongoClient;
var app = express();

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.listen(3000, function () {
  console.log('ISAL app listening on port 3000!');
});
