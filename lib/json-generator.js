'use strict'

const fs = require('fs-extra')
const redisStore = require('@lib/redis-store')
const JSON_LIST_PATH_SRC = 'frontend/public/status-list.json'
const JSON_LIST_PATH_DST = 'frontend/dist/status-list.json'

module.exports = function() {

  /**
   * Generator a JSON file containing the sorted array of each nameserver status objects.
   * Nameservers with status of FALSE (bad) will be first in the array.
   */
  async function init() {
    console.log('\n Updating JSON list...')
    let entries = await getAndSortEntries()
    let content = JSON.stringify(entries)
    await createJSONList(content)
    await copyJSONListToDST()
  }

  /**
   * Get all entries in Redis into a sorted array.
   * Nameservers with status of FALSE (bad) will be first in the array.
   * 
   * @return {Array} - Array of sorted nameserver status objects
   */
  async function getAndSortEntries() {
    let entries = await redisStore.getAllNameServerStatus()
    let sorted = entries.sort((a, b) => a.status - b.status)
    return sorted
  }

  /**
   * Write JSON-formatted content string to file.
   * 
   * @param {String} content - Stringified JSON object
   */
  async function createJSONList(content) {
    try {
    await fs.writeFile(JSON_LIST_PATH_SRC, content, 'utf8')
      
    } catch(e) {
      console.log(e)
    }
  }

  /**
   * Copy SRC JSON to DST directory
   */
  async function copyJSONListToDST() {
    await fs.copy(JSON_LIST_PATH_SRC, JSON_LIST_PATH_DST)
  }

  return {
    init
  }
}()