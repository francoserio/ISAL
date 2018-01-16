const http = require('http');
const express = require('express');
const validUrl = require('valid-url');
const favicon = require('serve-favicon');
const mongo = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const searchTerm = require('./models/searchTerm.js');
const request = require('request');

var app = express();

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded( { extended: true } ));

const CX = process.env.id || '002294623826931134762:wervykxjar8';
const API_KEY = process.env.key || 'AIzaSyB6meuFL_5UuuHC8qbCT7v5dAzO3bbY7Yw';

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/home.html', function (req, res) {
  res.sendFile(__dirname + '/views/home.html');
});

app.get('/search/:searchVal*', function(req, res) {
  var searchValor = req.params['searchVal'];
  var offsetValor = req.query['offset'];

  var outPutJson = {};

  mongo.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/imagesearchapi_franco', function(err2, db) {
    if (err2) {
      console.log('An error occured with mongoDB', err2);
    } else {
      //puedo poner la búsqueda en history
      var collection = db.collection('colimagesearchapi_franco');
      var data = new searchTerm ({
        search: searchValor,
        date: new Date()
      });
      collection.insert(data, function(err3, result) {
        if (err3) {
          console.log('Error insertando nueva búsqueda' + err3);
        }
        db.close();
      });
    }
  });

  var apiUrl = '';
  if (offsetValor >= 2) {
    apiUrl = 'https://www.googleapis.com/customsearch/v1?key=' + API_KEY + '&cx=' + CX + '&q=' + searchValor + '&searchType=image' + '&start=' + (offsetValor-1)*10 + '&fields=items(link,snippet,image/thumbnailLink,image/contextLink)';
  } else {
    apiUrl = 'https://www.googleapis.com/customsearch/v1?key=' + API_KEY + '&cx=' + CX + '&q=' + searchValor + '&searchType=image' + '&fields=items(link,snippet,image/thumbnailLink,image/contextLink)';
  }
  request(apiUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      outPutJson = JSON.parse(body);
      res.send('<pre>' + body + '</pre>');
    } else {
      console.log('Error API google ' + error);
    }
  });
});

app.get('/history', function(req, res) {
  mongo.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/imagesearchapi_franco', function(err1, db) {
    var collection = db.collection('colimagesearchapi_franco');
    collection.find({}).toArray(function(err2, result) {
      if (err2) {
        console.log('error history ' + err2);
      } else {
        res.json(result);
      }
    });
    db.close();
  });
});

app.get('/home', function(req, res) {
  res.sendFile(__dirname + '/views/home.html');
});

app.listen(process.env.PORT || 3000, function () {
  console.log('ISAL app listening on port 3000!');
});
