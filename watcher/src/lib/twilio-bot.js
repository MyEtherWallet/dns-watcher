'use strict'

// Imports //
import async from 'async'
import request from 'request-promise-native'
import redisStore from '@lib/redis-store'
import twilio from 'twilio'

const client = twilio(process.env.TWILIO_ID, process.env.TWILIO_TOKEN)

export default (() => {
  
  /**
   *  Use Twilio to call and notify command-separated number lists (defined in .env)
   */
  const phoneAlert = async () => {
    return new Promise(async (resolve, reject) => {
      // If message was sent within the past 30minutes, do not send //
      let canCall = await checkCallStatus('twilio-call-alert')
      if (!canCall) return resolve()

      const numbers = process.env.TWILIO_TO_NUMBER.split(',')
      async.each(numbers, async (number, done) => {
        await makeCall(number)
        done()
      }, () => {
        resolve()
      })
      
    })
  }

  /**
   * Make call to particular number, iterated from phoneAlert()
   *
   * @param  {String} number - Number to call
   */
  const makeCall = async (number) => {
    return new Promise(async (resolve, reject) => {

      client.calls
        .create({
          url: `https://status.myetherwallet.com/voice-alert`,
          to: number,
          from: process.env.TWILIO_FROM_NUMBER,
          method: 'GET'
        })
        .then(call => {
          console.log('Call Alert', call)
          return resolve()
        })
        .done()
    })
  }

  /**
   * Check if a call entry exists in Redis. If so, return false.
   * Otherwise, return true and create an entry. The idea is that one message can only be sent
   * every 30 minutes. This awkwardly repurposes the RedisStore lib meant to update nameserver status.
   * 
   * @param  {String} key - Key for call
   * @return {Boolean} - True if an entry does NOT exist. False if an entry DOES exist 
   */
  const checkCallStatus = async key => {
    let previousCall = await redisStore.getNameServerStatus(key)
    if (previousCall) return false
    await redisStore.setNameServerStatus(key, { status: false }, 1800)
    return true
  }

  return {
    phoneAlert
  }
})()
