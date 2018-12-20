'use strict'

// See: https://www.npmjs.com/package/module-alias //
import 'module-alias/register'

// Local Lib //
import healthCheck from '@lib/health-check'
import jsonGenerator from '@lib/json-generator'
import screenshot from '@lib/screenshot'
import telegramBot from '@lib/telegram-bot'

/**
 * DNS Watcher Loop
 *
 * This is the "init" function for the application which will:
 *
 * 1) Perform a "Health Check" on the DNS server resolutions
 * 2) On Health Check "end", re-run Health Check
 * 3) On Health Check "invalid" nameserver entry, create screenshot of resolution, and send Telegram message
 */
;(() => {
  // On 'end' event, re-initialize Health Check //
  healthCheck.emitter.on('end', async () => {
    healthCheck.init()
  })

  // On 'invalid' nameserver event, create screenshot of resolution, and send Telegram message //
  healthCheck.emitter.on('invalid', async data => {
    screenshot.add(data.addresses)
    console.log('invalid!', data)
    // await telegramBot.send(`Invalid DNS record found: ${data.nameserver}`)
  })

  // Initialize Health Check //
  healthCheck.init()
})()
