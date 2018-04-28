require("dotenv").config("../.env");
var superstatic = require('superstatic').server;
const fs = require("fs");
const path = require("path");
var history = require('connect-history-api-fallback');

const serverErrorLogger = require("../logger").serverErrors;


var spec = {
    port: 8080,
    // host: "54.70.164.31",
  "trailingSlash": false,
  compression: true,
  cwd: __dirname,
  // errorPage: __dirname + '/error.html',
  debug: true,
    config: {
        public: "./dist",
        "rewrites": [
            {"source": "/dns-report", "destination": "./validityList.json" }
        ]
    }
};

var app = superstatic(spec);
// app.use(history);

app.listen(function() {
  console.log("Website running", process.cwd());
});


app.use("/new-results", (req, res) => {
  console.log(req.url); //todo remove dev item

  let filepath = path.join(__dirname, "dist", "validityList.json");
  try {
    fs.access(filepath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
      if (err) {
        console.error(err);
        res.end("{\"timestamp\": \"" + new Date().toUTCString() + "\",\"good\":[\"building initial list\"], \"bad\":[\"building initial list\"]}");
      } else {
        fs.readFile(filepath, "utf-8", (err, _result) => {
          try {
            if(err) throw err;
            let jsonResult = JSON.parse(_result);
            let displayedList = /=\d*/.test(req.url) ? req.url.split("=")[1] : 0;
             // req.query.timestamp;
            let currentList = Date.parse(jsonResult.timestamp);
            if (+currentList > +displayedList) {
              res.end(JSON.stringify({result: true}));
            } else {
              res.end(JSON.stringify({result: false}));
            }
          } catch (e) {
            serverErrorLogger.error(e);
          }
        })
      }
    });
  } catch (e) {
    serverErrorLogger.error(e);
  }
});

