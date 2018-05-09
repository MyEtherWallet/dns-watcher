require("dotenv").config("../.env");
var superstatic = require('superstatic').server;
const fs = require("fs");
const path = require("path");
var history = require('connect-history-api-fallback');

const serverErrorLogger = require("../logger").serverErrors;

console.log(__dirname); //todo remove dev item
var spec = {
    port: 8080,
    // host: "54.70.164.31",
    "trailingSlash": false,
    compression: true,
    cwd: __dirname + "/dist",
    errorPage: __dirname + '/error.html',
    debug: true,
    config: {
        // public: "./dist",
        "rewrites": [
            {"source": "/dns-report", "destination": "./validityList.json"},
            {"source": "/new-results", "destination": "./timeCheck.json"}
        ]
    }
};

var app = superstatic(spec);
// app.use(history);

app.listen(function () {
    console.log("Website running", process.cwd());
});
/*

function getFilePath(name){
  return path.join(__dirname, "dist", "validityList.json")
}

app.use("/new-results", (req, res) => {
  console.log(req.url); //todo remove dev item

  let filepath = path.join(__dirname, "dist", "validityList.json");
  try {
    fs.access(filepath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
      if (err) {
        console.error(err);
        res.end("{\"timestamp\": \"" + new Date().toUTCString() + "\"}");
        // res.end("{\"timestamp\": \"" + new Date().toUTCString() + "\",\"good\":[\"building initial list\"], \"bad\":[\"building initial list\"]}");
      } else {
        fs.readFile(filepath, "utf-8", (err, _result) => {
          try {
            if(err) throw err;
            res.end(_result);
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

app.use("/dns-report", (req, res) => {
  console.log(req.url); //todo remove dev item

  let _filepath = path.join(__dirname, "dist", "timeCheck.json");//getFilePath("timeCheck.json");
  try {
    fs.access(_filepath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
      if (err) {
        console.error(err);
        res.end("{\"timestamp\": \"" + new Date().toUTCString() + "\"}");
      } else {
        fs.readFile(_filepath, "utf-8", (err, _result) => {
          try {
            if(err) throw err;
            res.end(_result);
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

*/
