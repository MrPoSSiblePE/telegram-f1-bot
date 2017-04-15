var env = require('node-env-file');
env(__dirname + '/.env');
var bot = require('./app/bot.js');
require('./app/webapp.js')(bot);
require('./app/functions.js')(bot);
