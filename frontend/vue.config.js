'use strict'

// See: https://www.npmjs.com/package/module-alias //
require('module-alias/register')

// Imports //
const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const dotenv = require('dotenv').config({ path: '../.env' })
const DotenvWebpack = require('dotenv-webpack')
const _ = require('underscore')

// Export //
module.exports = {
  configureWebpack: {
    plugins: [
      new DotenvWebpack({ path: '../.env' })
    ]
  },
  devServer: {
    open: true,
    host: '0.0.0.0',
    port: process.env.PORT,
    https: false,
    hotOnly: false,
    proxy: null,
    before: app => {
      const redisStore = require('@lib/redis-store')
      app.use('/dns-report', async (req, res, next) => {
        let entries = await redisStore.default.getAllNameServerStatus()
        let sorted_by_date = _.sortBy(entries, function(o) { return - (new Date(o.timestamp) )})
        let sorted_by_status = sorted_by_date.sort((a, b) => a.status - b.status)
        return res.json(sorted_by_status)
      })
    }
  }
};
