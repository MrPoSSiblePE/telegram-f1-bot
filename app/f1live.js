var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require('fs');
var cheerio = require('cheerio');

var pointstable = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

module.exports.Standings = getLiveData();


/**
 * Gets live standings from MTV
 */
function getLiveData() {
    var page = doXHRRequest('http://www.mtv.fi/asset/f1tulospalvelu/tulospalvelu_upotus_live_simplified_v2.shtml');
    //var page = doXHRRequest('http://www.mtv.fi/asset/f1tulospalvelu/ajax_etusivu.shtml?year=2017&id=273346&hidelinks=true&hidesome=true&simplifiedversion=true&nextandpreviousnavi=true');
    
    $ = cheerio.load(page);
    var liveStandings = {};

    var data = $("tbody").find("tr");
    data.each(function () {
        var driver = transformRowData($(this));
        liveStandings[driver.name] = driver;

        if(driver.name == "Carlos Sainz Jr") {
            liveStandings["Carlos Sainz"] = driver;
        }
        if(driver.name == "Nico Hulkenberg") {
            liveStandings["Nico Hülkenberg"] = driver;
        }
        if(driver.name == "Sergio Perez") {
            liveStandings["Sergio Pérez"] = driver;
        }

        if (driver.position < 11) {

            //driver.pointsStr = driver.points;
            //driver.points = parseInt(driver.points);
            driver.points = pointstable[driver.position -1];
            driver.pointsStr = "(+" + driver.points + ")";
        } else {
            driver.points = 0;
            driver.pointsStr = "";
        }
    });
    
    return liveStandings;
}

/**
 * Creates driver object from tr object
 * @param {*} tr 
 */
function transformRowData(tr) {
    var driver = createObjectFromChildrenClasses(tr);
    return driver;
}


function createObjectFromChildrenClasses(domObject) {
    var obj = {};

    domObject.children().each(function () {
        obj[this.attribs.class] = $(this).text().trim().replace(/\t/g, ' ');
    });

    return obj;
}


/**
 * Makes a XHR request to the given URL and returns the response text
 * @param {*} url 
 */
function doXHRRequest(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
}