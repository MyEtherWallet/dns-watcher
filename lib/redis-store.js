'use strict'

const redis = require('async-redis')
const client = redis.createClient()

module.exports = {

  /**
   * Update a given key/nameserver entry in Redis
   * 
   * @param  {String} key - The "key" (usually the nameserver) for the Redis entry
   * @param  {Object} obj - The object payload containing the status of a given key/nameserver
   */
  setNameServerStatus: async function(key, obj) {
    try {
      return await client.set(key, JSON.stringify(obj))
    } catch(e) {
      console.log(e)
    }
  },

  /**
   * Retrieve the object payload/status of a given key/nameserver Redis entry
   * 
   * @param  {String} key - The "key" (usually the nameserver) for the Redis entry
   * @return {Object} - The object payload containing the status of a given key/nameserver 
   */
  getNameServerStatus: async function(key) {
    try {
      let data = await client.get(key)
      return JSON.parse(data)
    } catch(e) {
      console.log(e)
    }
  }
}