'use strict'

// See: https://www.npmjs.com/package/module-alias //
import 'module-alias/register'

// Local Lib //
import githubFiles from '@lib/github-files'
import healthCheck from '@lib/health-check'
import jsonGenerator from '@lib/json-generator'
import screenshot from '@lib/screenshot'
import telegramBot from '@lib/telegram-bot'
import twilioBot from '@lib/twilio-bot'

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
    console.log('Invalid nameserver found: ', data)
    screenshot.add(data.addresses)
    let addressString = data.addresses.join(' ') || ''
    await telegramBot.send(`IP: ${data.nameserver[0] || ''}\nResolutions: ${addressString || ''}\nName: ${data.nameserver[2] || ''}\nCountry: ${data.nameserver[1] || ''}\n`)
  })

  // Initialize Health Check //
  // healthCheck.init()
  
  // Start Github File cache //
  // githubFiles.init()
  twilioBot.phoneAlert()
})()
