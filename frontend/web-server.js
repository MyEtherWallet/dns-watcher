"use strict";

// See: https://www.npmjs.com/package/module-alias //
require("module-alias/register");

// Imports //
const path = require("path");
const superstatic = require("superstatic");
const connect = require("connect");
const _ = require("underscore");
const queryString = require('query-string')
const bodyParser = require('body-parser')
const ENV_PATH = path.join(__dirname, "../.env");
require("dotenv").config({ path: ENV_PATH });

// Lib //
const redisStore = require("@lib/redis-store");
const githubFiles = require("@lib/github-files");

// Superstatic Options //
var spec = {
  port: 8080, // process.env.PORT,
  trailingSlash: false,
  compression: true,
  cwd: __dirname + "/dist",
  // errorPage: __dirname + "/dist/error.html",
  config: {
    rewrites: [],
    headers: [
      {
        source: "**/*.@(jpg|jpeg|gif|png)",
        headers: [
          {
            key: "Cache-Control",
            value: "max-age=7200"
          },
          {
            key: "Content-Type",
            value: "image/png"
          }
        ]
      }
    ]
  }
};

// Create Connect App //
var app = connect();
app.use(bodyParser.urlencoded({extended: false}))

// Override /dns-report route //
app.use('/dns-report', async (req, res, next) => {
  let entries = await redisStore.default.getAllNameServerStatus();
  let sorted_by_date = _.sortBy(entries, function(o) {
    return -new Date(o.timestamp);
  });
  let sorted_by_status = sorted_by_date.sort((a, b) => a.status - b.status);
  let json_string = JSON.stringify(sorted_by_status);
  return res.end(json_string);
});

app.use('/github-files', async (req, res, next) => {
  let githubFiles = await redisStore.default.getGithubFiles()
  let json_string = JSON.stringify(githubFiles)
  return res.end(json_string)
})

/**
 * Force update github files-cache
 * Requires query param @forceKey to equal FORCE_KEY set in .env
 */
app.use(`/update-github-files-${process.env.FORCE_KEY}`, async (req, res, next) => {
  // const parsedUrl = req._parsedUrl
  // const query = queryString.parse(parsedUrl.search)
  // const forceKey = query.forceKey
  githubFiles.default.force()
  return res.end('OK')

  // if (forceKey === process.env.FORCE_KEY) {
  // } else {
  //   return res.end('ERROR')
  // }
})

// Use superstatic to handle other routes //
app.use(superstatic(spec));

// Start Server //
app.listen(process.env.PORT, function() {
  console.log('Website running on port 8080');
});
