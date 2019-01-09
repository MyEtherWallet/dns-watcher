'use strict'

// Imports //
import request from 'request-promise-native'
import redisStore from '@lib/redis-store'

// Export //
export default (() => {
  /**
   * Send a message via Telegram to a particular chat.
   * Requires that process.env.TELEGRAM_KEY and process.env.TELEGRAM_CHAT_ID...
   * ...be defined in the .env file
   */
  const send = async msg => {
    // Ignore if no key provided //
    if (!process.env.TELEGRAM_KEY) return

    // If message was sent within the past 24hrs, do not send //
    let canSendMessage = await checkMessageStatus(msg)
    if (!canSendMessage) return

    // Request Payload //
    let options = {
      method: 'POST',
      url: `https://api.telegram.org/${process.env.TELEGRAM_KEY}/sendMessage`,
      headers: {
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
    } catch (e) {
      console.log('\nError sending Telegram message', e)
    }
  }

  /**
   * Check if a message entry exists in Redis. If so, return false.
   * Otherwise, return true and create an entry. The idea is that one message can only be sent
   * every 24 hours. This awkwardly repurposes the RedisStore lib meant to update nameserver status.
   * 
   * @param  {String} msg - Message to be sent via Telegram
   * @return {Boolean} - True if an entry does NOT exist. False if an entry DOES exist 
   */
  const checkMessageStatus = async msg => {
    let previousMessage = await redisStore.getNameServerStatus(msg)
    if (previousMessage) return false
    await redisStore.setNameServerStatus(msg, { status: false })
    return true
  }

  return {
    send
  }
})()
