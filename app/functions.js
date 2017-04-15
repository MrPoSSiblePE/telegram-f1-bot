var request = require('request');
module.exports = function (bot) {


  /**
  * Listens on /test and answers
  * @param {string} msg Incoming message
  */
  bot.onText(/\/test/, (msg) => {
    const chatId = msg.chat.id;
    const resp = "message received t. bottas"
    bot.sendMessage(chatId, resp);
  });

  /**
  * Listens on /test and answers
  * @param {string} msg Incoming message
  */
  bot.onText(/\/stream/, (msg) => {
    const chatId = msg.chat.id;
    const resp = "https://www.reddit.com/r/motorsportsstreams/";
    bot.sendMessage(chatId, resp);
  });

  /**
  * Listens on /driver, posts info
  * @param {string} msg
  * @param {string} match
  */
  bot.onText(/\/driver (.+)$/, (msg, match) => {

    var driver = match[1];
    var url = "http://ergast.com/api/f1/drivers/" + driver + ".json";

    queryData(url, function (json) {
        const chatId = msg.chat.id;
        var driverNumber = json.MRData.DriverTable.Drivers[0].permanentNumber;
        var driverCode = json.MRData.DriverTable.Drivers[0].code;
        var firstName = json.MRData.DriverTable.Drivers[0].givenName;
        var lastName = json.MRData.DriverTable.Drivers[0].familyName;
        var url = json.MRData.DriverTable.Drivers[0].url;
        var resp = driverNumber + " " + driverCode + " - " + firstName + " " + lastName + "\n" + url;

        bot.sendMessage(chatId, resp);
    })
  });


  /**
  * Listens on /standings, posts standings table
  * @param {string} msg
  * @param {string} match
  */
  bot.onText(/\/standings (.+)$/, (msg, match) => {

    var number = match[1];
    var url = "http://ergast.com/api/f1/current/driverStandings.json";

    queryData(url, function (json) {
        const chatId = msg.chat.id;
        var standingsList = json.MRData.StandingsTable.StandingsLists[0];
        var season = json.MRData.StandingsTable.StandingsLists[0].season;
        var round = json.MRData.StandingsTable.StandingsLists[0].round;
        var total = json.MRData.total;
        var drivers = "";

        for (i = 0; i < number; i++) {
          drivers += standingsList.DriverStandings[i].position + ". ";
          drivers += standingsList.DriverStandings[i].Driver.code + " ";
          drivers += " - " + standingsList.DriverStandings[i].points + " points \n";
        }

        var resp = "Season " + season + " | Race " + round + "/" + total + "\n\n" + drivers;
        bot.sendMessage(chatId, resp);
      });
    });

  function queryData(url, callback) {
    request(url, function (error, response, data) {
      if (!error && response.statusCode == 200) {
        var json = JSON.parse(data);
        callback(json);
      }
    });
  }



};
