'use strict'

// Imports //
import redis from 'async-redis'

// Constants //
const client = redis.createClient({
  host: process.env.REDIS_HOST || '127.0.0.1'
})

// Export //
export default (() => {
  /**
   * Update a given key/nameserver entry in Redis. The entry will expire in one day.
   *
   * @param  {String} key - The "key" (usually the nameserver) for the Redis entry
   * @param  {Object} obj - The object payload containing the status of a given key/nameserver
   */
  const setNameServerStatus = async (key, obj, ttl) => {
    try {
      let expiry = ttl || 86400
      await client.set(key, JSON.stringify(obj))
      client.expire(key, expiry)
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * Retrieve the object payload/status of a given key/nameserver Redis entry
   *
   * @param  {String} key - The "key" (usually the nameserver) for the Redis entry
   * @return {Object} - The object payload containing the status of a given key/nameserver
   */
  const getNameServerStatus = async key => {
    try {
      let data = await client.get(key)
      return JSON.parse(data)
    } catch (e) {
      console.log(e)
      return null
    }
  }

  /**
   * Retrieve each and every nameserver Redis entrt and return in an array.
   *
   * @return {Array} - Array of nameserver payload objects
   */
  const getAllNameServerStatus = async () => {
    try {
      let keys = await client.keys('*')
      let entries = keys.map(async key => {
        return await getNameServerStatus(key)
      })
      return await Promise.all(entries)
    } catch (e) {
      console.log(e)
      return []
    }
  }

  /**
   * Store given array of github files in Redis
   * 
   * @param  {Array} arr - Array of github file objects
   */
  const setGithubFiles = async (arr) => {
    const key = 'github-files'
    try {
      await client.set(key, JSON.stringify(arr))
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * Retrieve array of github files from Redis
   * 
   * @return {Array} - Array of github file objects
   */
  const getGithubFiles = async () => {
    const key = 'github-files'
    try {
      let data = await client.get(key)
      return JSON.parse(data)
    } catch (e) {
      console.log(e)
      return null
    }
  }

  return {
    setNameServerStatus,
    getNameServerStatus,
    getAllNameServerStatus,
    setGithubFiles,
    getGithubFiles
  }
})()
