require("dotenv").config("../.env");
var superstatic = require('superstatic').server;
// const fs = require("fs");
// const path = require("path");
// var history = require('connect-history-api-fallback');

var spec = {
    port: 8080,
    // host: "54.70.164.31",
    "trailingSlash": false,
    compression: true,
    cwd: __dirname + "/dist",
    errorPage: __dirname + '/error.html',
    // debug: true,
    config: {
        // public: "./dist",
        "rewrites": [
            {"source": "/dns-report", "destination": "./validityList.json"},
            {"source": "/new-results", "destination": "./timeCheck.json"}
        ]
    }
};

var app = superstatic(spec);

app.listen(function () {
    console.log("Website running on port 8080.  http://localhost:8080");
});
