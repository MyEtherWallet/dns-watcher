'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')
const path = require('path')
let ENV_PATH = path.join(__dirname, '../../.env')
require('dotenv').config({ path: ENV_PATH })

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"'
})
