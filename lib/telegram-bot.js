'use strict'

const request = require('request-promise-native')

module.exports = function() {

  /**
   * Send a message via Telegram to a particular chat.
   * Requires that process.env.TELEGRAM_KEY and process.env.TELEGRAM_CHAT_ID
   * be defined in the .env file
   */
  async function send(msg) {
    // Ignore if no key provided //
    if(!process.env.TELEGRAM_KEY) return

    // Request Payload //
    let options = {
      method: 'POST',
      url: `https://api.telegram.org/${process.env.TELEGRAM_KEY}/sendMessage`,
      headers:
        {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      form: {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: msg
      }
    }

    // Send request //
    try {
      await request(options)
    } catch(e) {
      console.log('Error sending Telegram message')
    }
  }

  return {
    send
  }
}()