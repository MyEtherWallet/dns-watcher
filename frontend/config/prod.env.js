'use strict'
const path = require('path')
let ENV_PATH = path.join(__dirname, '../../.env')
require('dotenv').config({ path: ENV_PATH })

module.exports = {
  NODE_ENV: '"production"',
  DOMAIN: '"' + process.env.DOMAIN + '"',
  PRODUCTION_SITE: '"' + process.env.PRODUCTION_SITE + '"',
  STATUS_SITE: '"' + process.env.STATUS_SITE + '"',
  GITHUB_SITE: '"' + process.env.GITHUB_SITE + '"'
}
