'use strict'

// See: https://www.npmjs.com/package/module-alias //
require('module-alias/register')

// Imports //
const path = require('path')
const superstatic = require('superstatic')
const connect = require('connect')
const _ = require('underscore')
const ENV_PATH = path.join(__dirname, '../.env')
require('dotenv').config({ path: ENV_PATH })

// Lib //
const redisStore = require('@lib/redis-store')
 
// Superstatic Options //
var spec = {
  port: process.env.PORT,
  'trailingSlash': false,
  compression: true,
  cwd: __dirname + '/dist',
  errorPage: __dirname + '/error.html',
  config: {
    'rewrites': [
      // {'source': '/dns-report', 'destination': '/dns-report'}
    ],
    "headers": [
      {
        "source" : "**/*.@(jpg|jpeg|gif|png)",
        "headers" : [{
          "key" : "Cache-Control",
          "value" : "max-age=7200"
        }, {
          "key": "Content-Type",
          "value": "image/png"
        }]
      }]
  }
};

// Create Connect App //
var app = connect()

// Override /dns-report route //
app.use('/dns-report', async (req, res, next) => {
  let entries = await redisStore.default.getAllNameServerStatus()
  let sorted_by_date = _.sortBy(entries, function(o) { return - (new Date(o.timestamp) )})
  let sorted_by_status = sorted_by_date.sort((a, b) => a.status - b.status)
  let json_string = JSON.stringify(sorted_by_status)
  return res.end(json_string)
})

// Use superstatic to handle other routes //
app.use(superstatic(spec))

// Start Server //
app.listen(process.env.PORT, function() {
  console.log('Website running on port 8080.  http://localhost:8080')
})

