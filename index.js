'use strict'

// https://stackoverflow.com/questions/10777657/node-js-dns-lookup-how-to-set-timeout //

// See: https://www.npmjs.com/package/module-alias //
require('module-alias/register')

// See: https://www.npmjs.com/package/dotenv //
require('dotenv').config()

// Local Lib //
const healthCheck = require('@lib/health-check')
const jsonGenerator = require('@lib/json-generator')
const screenshot = require('@lib/screenshot')
const telegramBot = require('@lib/telegram-bot')

/**
 * DNS Watcher Loop
 * 
 * This is the "init" function for the application which will:
 * 
 * 1) Perform a "Health Check" on the DNS server resolutions
 * 2) On Health Check "end", generate a resulting JSON file for the static frontend, and re-run Health Check
 * 3) On Health Check "invalid" nameserver entry, create screenshot of resolution, and send Telegram message
 */
!function init() {
  // On 'end' event, generate JSON list and re-initialize Health Check //
  healthCheck.emitter.on('end', async () => {
    await jsonGenerator.init()
    healthCheck.init()
  })

  // On 'invalid' nameserver event, create screenshot of resolution, and send Telegram message //
  healthCheck.emitter.on('invalid', async (data) => {
    screenshot.add(data.addresses)
    await telegramBot.send(`Invalid DNS record found: ${data.nameserver}`)
  })

  // Initialize Health Check //
  healthCheck.init()
}()