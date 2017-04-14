var env = require('node-env-file');
var bot = require('./app/bot.js');
require('./app/webapp.js')(bot);
require('./app/functions.js')(bot);
