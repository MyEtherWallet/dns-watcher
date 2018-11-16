'use strict'

// Modules //
const async = require('async')
const countries = require('i18n-iso-countries')
const dns = require('dns')
const {EventEmitter} = require('events')
const ip = require('ip')
const moment = require('moment')
const momentDurationFormatSetup = require('moment-duration-format')
const {promisify} = require('util')
const rateLimit = require('function-rate-limit')

// Local Lib/Lists //
const allowedResolutions = require('@lists/allowed-resolutions.json')
const nameserverList = require('@lib/nameserver-list')
const progressBar = require('@lib/progress-bar')
const redisStore = require('@lib/redis-store')
const screenshot = require('@lib/screenshot')

// Constants //
const URL = 'myetherwallet.com'
const REQUESTS_PER_SECOND = 50
const BATCH_SIZE = 500

// Setup //
momentDurationFormatSetup(moment)

// Export //
module.exports = function() {

  let nameservers = [] // Array of nameservers
  let emitter = new EventEmitter() // Event emitter... obviously

  /**
   * Initialization function
   * Retrieve list of nameservers and systematically check each one
   * Update Redis entries with the status of each nameserver
   */
  async function init() {

    // Populate nameserver list array //
    nameservers = await nameserverList.init()

    // Create Progress Bar //
    progressBar.init(nameservers.length)

    // Start Queue //
    queue()
  }

  /**
   * Start queueing nameserver checks in batches of BATCH_SIZE at a time.
   * Also rate-limit requests at RATE_LIMIT requests per second.
   * If at the end of a batch, there are still more nameserver entries, continue queue.
   */
  async function queue() {
    // Pull array of BATCH_SIZE from nameservers array //
    let currentQueue = nameservers.splice(0, BATCH_SIZE)

    // Function that will be rate-limited //
    let fn = rateLimit(REQUESTS_PER_SECOND, 1000, async function(ns, done) {
      await checkNameServer(ns)
      progressBar.update()
      done()
    })

    // Asynchronously iterate through nameservers with rate-limited function //
    async.forEach(currentQueue, (ns, done) => {
      fn(ns, done)
    }, () => {
      if(nameservers.length > 0) return queue()
      emitter.emit('end')
    })
  }

  /**
   * Perform "health check" on a given nameserver entry and update Redis with the results
   * 
   * @param  {Array} - Nameserver info array
   */
  async function checkNameServer(nameserver) {
    try {
      let nameserverAddress = nameserver[0]
      let addresses = await getARecords(nameserverAddress)
      if(addresses){
        let isValid = isValidRecord(addresses)
        if(!isValid) screenshot.add(addresses[0])
        updateRedisEntry(nameserver, addresses, isValid)
      }
    } catch(e) {
      console.log(e)
    }
  }

  /**
   * Given a nameserver, attempt to resolve/obtain a list of A record addresses associated with the global URL name
   * 
   * @param  {String} nameserver - IP address of a particular nameserver
   * @return {Array} List of A records associated with the URL according to this particular nameserver 
   */
  async function getARecords(nameserver) {
    try {
      let resolver = new dns.Resolver()
      resolver.setServers([nameserver])
      let resolvePromise = promisify(resolver.resolve).bind(resolver)
      let addresses = await resolvePromise(URL, 'A')
      await process.nextTick
      return addresses
    } catch(e) {
      return
    }
  }

  /**
   * Given an array of addresses, check to validate whether each and every address is a valid IP
   * within the list of "allowed resolutions"
   * 
   * @param  {Array}  addresses - Array of IP addresses (returned from a nameserver resolution)
   * @return {Boolean} Whether or not the array of addresses/DNS record is valid or not
   */
  function isValidRecord(addresses) {
    let isValid = false
    addresses.forEach(address => {
      allowedResolutions.forEach(cidr => {
        if(ip.cidrSubnet(cidr).contains(address)) return isValid = true
      })
    })
    return isValid
  }

  /**
   * Update Redis database with key:nameserver and status payload object
   * 
   * @param  {Array}  nameserver - Nameserver info array
   * @param  {Array}  addresses  - Resolved addresses of URL for this particular nameserver
   * @param  {Boolean} isValid - Whether or not nameserver is confirmed to resolve correctly
   */
  async function updateRedisEntry(nameserver, addresses, isValid) {
    await redisStore.setNameServerStatus(nameserver[0], {
      ns: nameserver[0],
      timestamp: new Date().toUTCString(),
      status: isValid,
      country: countries.getName(nameserver[1], 'en'),
      countryShort: nameserver[1],
      resolved: addresses
    })
  }

  return {
    init,
    emitter
  }
}()