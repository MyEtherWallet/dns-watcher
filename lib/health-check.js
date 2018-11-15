'use strict'

// Modules //
const cliProgress = require('cli-progress')
const countries = require('i18n-iso-countries')
const dns = require('dns')
const ip = require('ip')
const moment = require('moment')
const {promisify} = require('util')
const rateLimit = require('function-rate-limit')

// Local Lib/Lists //
const allowedResolutions = require('@lists/allowed-resolutions.json')
const nameserverList = require('@lib/nameserver-list')
const redisStore = require('@lib/redis-store')

// Constants //
const URL = 'myetherwallet.com'
const REQUESTS_PER_SECOND = 20

// Export //
module.exports = function() {

  let nameservers = [] // Array of nameservers
  let progressBar // Progress bar object
  let currentProgress = 0 // Current number

  /**
   * Initialization function
   * Retrieve list of nameservers and systematically check each one
   * Update Redis entries with the status of each nameserver
   */
  async function init() {

    // Populate nameserver list array //
    nameservers = await nameserverList.init()

    // Create Progress Bar //
    console.log(` Starting health check at ${moment().utc().toISOString()}`)
    currentProgress = 0
    progressBar = new cliProgress.Bar({
      format: ' {bar} {percentage}% | {value}/{total}'
    }, cliProgress.Presets.shades_classic)
    progressBar.start(nameservers.length, currentProgress)

    // Function that will be rate-limited //
    let fn = rateLimit(REQUESTS_PER_SECOND, 1000, function(ns) {
      checkNameServer(ns)
    })

    // Iterate through nameservers with rate-limited function //
    nameservers.forEach(nameserver => {
      fn(nameserver)
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
      if(Array.isArray(addresses)){
        let isValid = isValidRecord(addresses)
        updateRedisEntry(nameserver, addresses, isValid)
      } else {
        updateRedisEntry(nameserver, [], false)
      }
      currentProgress++
      if(currentProgress < nameservers.length) progressBar.update(currentProgress)
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
      // console.log(e)
      return e
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
    // let entry = await redisStore.getNameServerStatus(nameserver[0])
    // console.log(entry)
  }

  return {
    init: init
  }
}()