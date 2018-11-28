'use strict'
const path = require('path')
let ENV_PATH = path.join(__dirname, '../.env')
require('dotenv').config({ path: ENV_PATH })
var superstatic = require('superstatic').server;

console.log(process.env)

var spec = {
  port: 8080,
  'trailingSlash': false,
  compression: true,
  cwd: __dirname + '/dist',
  errorPage: __dirname + '/error.html',
  config: {
    'rewrites': [
      {'source': '/dns-report', 'destination': './status-list.json'},
      {'source': '/new-results', 'destination': './timeCheck.json'},
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

var app = superstatic(spec);

app.listen(function() {
  console.log('Website running on port 8080.  http://localhost:8080');
});
