"use strict";

const client = require("coffea")(require("./config.json"));
const request = require("request");
const fs = require("fs");
const moment = require("moment");
const cheerio = require("cheerio");

client.on("message", function(event) {
  let logfile =
    "web/" +
    event.channel.name.slice(1) +
    "_" +
    moment().format("YYYY-MM-DD") +
    ".log";

  let mesg =
    moment().format("HH:mm:ss") +
    " " +
    event.user.nick +
    ": " +
    event.message +
    "\n";

  checkLogDir("./web/", function(error) {
    if (error) {
      console.log("Logging directory can't be created", error);
    } else {
      fs.appendFile(logfile, mesg, function(error) {
        if (error) {
          console.log("Error writing log! " + error);
        }
      });
    }
  });

  let words = event.message.split(" ");
  for (let i = 0; i < words.length; i++) {
    let newURL = findURL(words[i]);
    if (newURL) {
      request(newURL, function(error, response, body) {
        if (error || response.statusCode !== 200) {
          return event.reply(
            "Error " + response.statusCode + " when fetching " + newURL + "."
          );
        }
        let $ = cheerio.load(body);
        if ($("title").text().length !== 0) {
          return event.reply(
            $("title")
              .text()
              .trim()
          );
        } else {
          return event.reply("The webpage does not contain a title element.");
        }
      });
    }
  }
});

function findURL(data) {
  data = data.replace(/^[<[]/, "");
  data = data.replace(/[>\]!.,?]$/, "");

  // via https://gist.github.com/dperini/729294 from Diego Perini.
  let expr = new RegExp(
    "^" +
      // protocol identifier (optional)
      // short syntax // still required
      "(?:(?:(?:https?|ftp):)?\\/\\/)" +
      // user:pass BasicAuth (optional)
      "(?:\\S+(?::\\S*)?@)?" +
      "(?:" +
      // IP address exclusion
      // private & local networks
      "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
      "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
      "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
      // IP address dotted notation octets
      // excludes loopback network 0.0.0.0
      // excludes reserved space >= 224.0.0.0
      // excludes network & broacast addresses
      // (first & last IP address of each class)
      "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
      "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
      "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
      "|" +
      // host & domain names, may end with dot
      // can be replaced by a shortest alternative
      // (?![-_])(?:[-\\w\\u00a1-\\uffff]{0,63}[^-_]\\.)+
      "(?:" +
      "(?:" +
      "[a-z0-9\\u00a1-\\uffff]" +
      "[a-z0-9\\u00a1-\\uffff_-]{0,62}" +
      ")?" +
      "[a-z0-9\\u00a1-\\uffff]\\." +
      ")+" +
      // TLD identifier name, may end with dot
      "(?:[a-z\\u00a1-\\uffff]{2,}\\.?)" +
      ")" +
      // port number (optional)
      "(?::\\d{2,5})?" +
      // resource path (optional)
      "(?:[/?#]\\S*)?" +
      "$",
    "i"
  );
  if (expr.test(data)) {
    return data;
  }
}

function checkLogDir(directory, callback) {
  fs.stat(directory, function(err, stats) {
    if (err && err.errno === 34) {
      fs.mkdir(directory, callback);
    } else {
      callback(err);
    }
  });
}
