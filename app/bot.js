const TOKEN = process.env.TOKEN || "your_token";
const TelegramBot = require('node-telegram-bot-api');
var request = require('request');
var env = process.env.NODE_ENV;

// Use polling when not in production
if(env === "production") {
  const url = process.env.SERVICE_URL;
  var bot = new TelegramBot(TOKEN);
  bot.setWebHook(url + "/" + TOKEN);
  module.exports = bot;
} else {
  var bot = new TelegramBot(TOKEN, { polling: true });
}

console.log("bot running");

/**
* Listens on /test and answers
* @param {string} msg Incoming message
*/
bot.onText(/\/test/, (msg) => {
  const chatId = msg.chat.id;
  const resp = "message received t. bottas"
  bot.sendMessage(chatId, resp);

});




bot.onText(/\!driver (.+)$/, (msg, match) => {

  var driver = match[1];
  var url = "http://ergast.com/api/f1/drivers/" + driver + ".json";

  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const chatId = msg.chat.id;
      var json = body;

      var driverNumber = json.MRData.DriverTable.Drivers[0].permanentNumber;
      var driverCode = json.MRData.DriverTable.Drivers[0].code;
      var firstName = json.MRData.DriverTable.Drivers[0].givenName;
      var lastName = json.MRData.DriverTable.Drivers[0].familyName;

      var resp = firstName + " " + lastName + " " + driverNumber + " " + driverCode;

      bot.sendMessage(chatId, resp);
    }
  })
});
