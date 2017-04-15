const TOKEN = process.env.TOKEN;
const TelegramBot = require('node-telegram-bot-api');
var environment = process.env.NODE_ENV;

// Use polling when not in production
if(environment === "production") {
  const url = process.env.SERVICE_URL;
  var bot = new TelegramBot(TOKEN);
  bot.setWebHook(url + "/" + TOKEN);
  console.log("webhook set");
} else {
  var bot = new TelegramBot(TOKEN, { polling: true });
  console.log("polling set");
}

module.exports = bot;
