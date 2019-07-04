'use strict'

// See: https://www.npmjs.com/package/module-alias //
require('module-alias/register')

// Imports //
const DotenvWebpack = require('dotenv-webpack')
const _ = require('underscore')

// Export //
module.exports = {
  configureWebpack: {
    plugins: [
      new DotenvWebpack({ 
        systemvars: true
      })
    ]
  },
  devServer: {
    open: true,
    host: '0.0.0.0',
    port: 8080, //process.env.PORT,
    https: false,
    hotOnly: false,
    proxy: null,
    before: app => {
      const redisStore = require('@lib/redis-store')
      const githubFiles = require('@lib/github-files')
      const VoiceResponse = require('twilio').twiml.VoiceResponse

      app.use('/dns-report', async (req, res, next) => {
        let entries = await redisStore.default.getAllNameServerStatus()
        let sorted_by_date = _.sortBy(entries, function(o) { return - (new Date(o.timestamp).getTime()) })
        // let sorted_by_status = sorted_by_date.sort((a, b) => a.status - b.status)
        return res.json(sorted_by_date)
      })

      app.use('/github-files', async (req, res, next) => {
        let githubFiles = await redisStore.default.getGithubFiles()
        return res.json(githubFiles)
      })

      app.use('/update-github-files', async (req, res, next) => {
         return res.json({})
      })
      app.use('/voice-alert', async (req, res, next) => {
        const twiml = new VoiceResponse();

        twiml.say('Alert! File mismatch on My Ether Wallet. Please check telegram for more information.');

        res.writeHead(200, { 'Content-Type': 'text/xml' });
        return res.end(twiml.toString())
      })
    }
  }
};
