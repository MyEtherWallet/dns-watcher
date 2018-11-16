'use strict'

const redis = require('async-redis')
const client = redis.createClient()

module.exports = function() {

  /**
   * Update a given key/nameserver entry in Redis
   * 
   * @param  {String} key - The "key" (usually the nameserver) for the Redis entry
   * @param  {Object} obj - The object payload containing the status of a given key/nameserver
   */
  async function setNameServerStatus(key, obj) {
    try {
      return await client.set(key, JSON.stringify(obj))
    } catch(e) {
      console.log(e)
    }
  }

  /**
   * Retrieve the object payload/status of a given key/nameserver Redis entry
   * 
   * @param  {String} key - The "key" (usually the nameserver) for the Redis entry
   * @return {Object} - The object payload containing the status of a given key/nameserver 
   */
  async function getNameServerStatus(key) {
    try {
      let data = await client.get(key)
      return JSON.parse(data)
    } catch(e) {
      console.log(e)
    }
  }

  /**
   * Retrieve each and every nameserver Redis entrt and return in an array.
   * 
   * @return {Array} - Array of nameserver payload objects
   */
  async function getAllNameServerStatus() {
    try {
      let keys = await client.keys('*')
      let entries = keys.map(async(key) => { return await getNameServerStatus(key) })
      return await Promise.all(entries)
    } catch(e) {
      console.log(e)
    }
  }

  return {
    setNameServerStatus,
    getNameServerStatus,
    getAllNameServerStatus
  }
}()