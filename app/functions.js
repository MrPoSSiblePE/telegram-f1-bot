var request = require('request');
var ical = require('ical');
var cache = require('memory-cache');

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

  bot.onText(/\/kill/, (msg) => {
    const chatId = msg.chat.id;
    if (process.env.NODE_ENV == "dev") {
      console.log('Killing process');
      bot.sendMessage(chatId, "Killing process");
      setTimeout(function () {
        process.exit();
      }, 2000);
    }
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
  * Listens on /live, posts standings table with points from ongoing gp
  * @param {string} msg
  * @param {string} match
  */
  bot.onText(/\/live/, (msg) => {
    var live = require('./f1live');
    var liveStandings = live.Standings;
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
      var livepositions = [];

      for (i = 0; i < json.MRData.total; i++) {
        if (i == json.MRData.total) {
          break;
        }
        var liveData = liveStandings[standingsList.DriverStandings[i].Driver.givenName + " " + standingsList.DriverStandings[i].Driver.familyName];
        console.log(liveData);

        // TODO: tää käsittely paremmaks ja laske pisteet
        if (liveData != undefined) {
          var livePoints = parseInt(standingsList.DriverStandings[i].points) + liveData.points;
          livepositions.push({
              origPosition : standingsList.DriverStandings[i].position,
              newPoints : livePoints,
              driverCode : standingsList.DriverStandings[i].Driver.code,
              racePoints: liveData.pointsStr
          });
        } else {
          livepositions.push({
              origPosition : standingsList.DriverStandings[i].position,
              newPoints : parseInt(standingsList.DriverStandings[i].points),
              driverCode : standingsList.DriverStandings[i].Driver.code,
              racePoints: ''
          });
        }
      }

      livepositions.sort(function (a, b) {
        return b.newPoints - a.newPoints;
      })

      console.log(livepositions);

      for (var i = 0; i < livepositions.length; i++) {
        var newstanding = livepositions[i];
        var newposition = i + 1;
        var diff = positionDifference(livepositions[i].origPosition, newposition);
        if (newstanding.newPoints > 0) {
          console.log(newposition, newstanding.driverCode, newstanding.racePoints, newstanding.newPoints, diff);
          drivers += newposition + ". ";
          drivers += newstanding.driverCode + " - " + newstanding.newPoints + " points " + newstanding.racePoints + "\n";
        }
      }

      var resp = "Championship standings with current race positions \n\n" + drivers;
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


  /**
   * Fetch random imgur images (top / month) from formula1 subreddit
   * @param {string} msg
   */
  bot.onText(/\/imgur/, (msg) => {
    const chatId = msg.chat.id;
    const clientID = process.env.IMGUR_CLIENTID;
    var auth = 'Client-ID ' + clientID;

    var options = {
      url: 'https://api.imgur.com/3/gallery/r/formula1/top/month/',
      headers: {
        'Authorization': auth
      }
    };

    queryData(options, function (json) {
      var data = json.data;
      var rand = Math.floor(Math.random() * data.length);
      var resp = data[rand].title + "\n" + data[rand].link;
      bot.sendMessage(chatId, resp);
    });

  });

  bot.onText(/\/bottaswmr/, (msg) => {
    const chatId = msg.chat.id;
    var url = 'http://www.reddit.com/user/BottasWMR/.json?sort=new&limit=1';

    queryData(url, function (json) {
      var data = json.data.children[0].data;
      var author = data.author;
      var permalink = data.link_permalink;
      var subreddit = data.subreddit_name_prefixed;

      var resp = author + " at " + subreddit + "\n" + permalink;
      bot.sendMessage(chatId, resp);
    });

  });

  function positionDifference(a, b) {
    var diff = a-b;
    if (a > b) {
       return '+'+ diff +' positions';
    }
    if (a < b) {
       return a-b +" positions";
    }
    return "";
  }


  /**
   * Sends and caches requests and responses
   * @param {string} url url to send request to
   * @param {function} callback callback
   */
  function queryData(url, callback) {
    var cachedResp = cache.get(url);

    // Check if this url exists in cache
    if (cachedResp) {
      callback(cachedResp);
    } else {
      request(url, function (error, response, data) {
        if (!error && response.statusCode == 200) {
          var json = JSON.parse(data);

          // Cache request and response for 30 minutes
          cache.put(url, json, 30 * 60 * 1000, function (key, value) {
            console.log("Cached response with key: " + key);
          });
        }
        callback(json);
      });
    }
  }

};
