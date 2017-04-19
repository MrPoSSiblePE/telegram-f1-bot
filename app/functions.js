var request = require('request');
var ical = require('ical');
module.exports = function (bot) {


  /**
  * Listens on /stream and answers
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
  bot.onText(/\/standings/, (msg) => {
    var str = msg.text;
    var arr = str.split(" ");
    var number = arr[1] || 10;
    var url = "http://ergast.com/api/f1/current/driverStandings.json";

    queryData(url, function (json) {
        const chatId = msg.chat.id;
        var standingsList = json.MRData.StandingsTable.StandingsLists[0];
        var season = json.MRData.StandingsTable.StandingsLists[0].season;
        var round = json.MRData.StandingsTable.StandingsLists[0].round;
        var total = json.MRData.total;
        var drivers = "";

        for (i = 0; i < number; i++) {
          if (i == json.MRData.total) {
            break;
          }
          drivers += standingsList.DriverStandings[i].position + ". ";
          drivers += standingsList.DriverStandings[i].Driver.code + " ";
          drivers += " - " + standingsList.DriverStandings[i].points + " points \n";
        }

      var resp = "Season " + season + " | Race " + round + "/" + total + "\n\n" + drivers;
      bot.sendMessage(chatId, resp);
    });
  });

  /**
  * Listens on /next, posts information on next session
  * @param {string} msg
  * @param {string} match
  */
  bot.onText(/\/next(\s)*(.*)$/, (msg, match) => {
    const chatId = msg.chat.id;
    var url = 'https://www.f1calendar.com/download/f1-calendar_p1_p2_p3_q_gp.ics';
    console.log(match);
    
    if (match[2] == 'gp') {
      url = 'https://www.f1calendar.com/download/f1-calendar_gp.ics';
    }

    if (match[2] == 'quali') {
      url = 'https://www.f1calendar.com/download/f1-calendar_q.ics';
    }

    ical.fromURL(url, {}, function (err, data) {
      var resp = "";
      for (var k in data) {
        if (data.hasOwnProperty(k)) {
          ///console.log(data[k].summary);
          var sessionStr = data[k].dtstamp;
          var sessionDate = new Date(sessionStr.slice(0, 4), parseInt(sessionStr.slice(4, 6) - 1), sessionStr.slice(6, 8), sessionStr.slice(9, 11), sessionStr.slice(11, 13), 0, 0);
          sessionDate.setUTCHours(sessionStr.slice(9, 11));

          if (data[k].end > Date.now()) {
            if (data[k].start < Date.now()) {
              resp += 'Ongoing: ' + data[k].summary + '\r\n';
            }
            if (data[k].start > Date.now()) {
              resp += "Next session: " + data[k].summary + " " + sessionDate;
              bot.sendMessage(chatId, resp);
              break;
            }
          }
        }
      }
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
