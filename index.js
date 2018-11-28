'use strict'

// See: https://www.npmjs.com/package/module-alias //
require('module-alias/register')

// See: https://www.npmjs.com/package/dotenv //
require('dotenv').config()

// https://stackoverflow.com/questions/10777657/node-js-dns-lookup-how-to-set-timeout //
const healthCheck = require('@lib/health-check')
const jsonGenerator = require('@lib/json-generator')

/**
 * DNS Watcher Loop
 * 
 * This is the "init" function for the application which will:
 * 
 * 1) Perform a "Health Check" on the DNS server resolutions
 * 2) On Health Check "end", generate a resulting JSON file for the static frontend
 * 3) Re-run Health Check
 */
!function init() {
  healthCheck.emitter.on('end', async () => {
    await jsonGenerator.init()
    healthCheck.init()
  })
  healthCheck.init()
}()


