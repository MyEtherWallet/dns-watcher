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
const dotenvWebpack = new DotenvWebpack({ path: '../.env' })

// Lib //
const redisStore = require('@lib/redis-store')

// Export //
module.exports = {
  configureWebpack: {
    plugins: [
      dotenvWebpack
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
      app.use('/dns-report', async (req, res, next) => {
        let entries = await redisStore.default.getAllNameServerStatus()
        let sorted = entries.sort((a, b) => a.status - b.status)
        return res.json(sorted)
      })
    }
  }
};
