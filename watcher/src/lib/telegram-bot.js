'use strict'

// Imports //
import request from 'request-promise-native'

// Export //
export default (() => {

  /**
   * Send a message via Telegram to a particular chat.
   * Requires that process.env.TELEGRAM_KEY and process.env.TELEGRAM_CHAT_ID...
   * ...be defined in the .env file
   */
  const send = async (msg) => {
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
      console.log('\nError sending Telegram message')
    }
  }

  return {
    send
  }
})()