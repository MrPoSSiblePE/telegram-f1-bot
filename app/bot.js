const TOKEN = process.env.TOKEN || "your_token";
var env = process.env.NODE_ENV;
const TelegramBot = require('node-telegram-bot-api');

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
  const resp = "message received t. bottas";

  bot.sendMessage(chatId, resp);
});
