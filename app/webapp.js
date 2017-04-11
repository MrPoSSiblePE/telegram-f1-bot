var packageInfo = require('../package.json');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var port = process.env.PORT;
var token = process.env.TOKEN;

var server = app.listen(port, function () {
  console.log('listening');
});

app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send("hello world");
});

module.exports = function (bot) {
  app.post('/' + token, function (req, res) {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
};
