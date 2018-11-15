'use strict'

// Modules //
const async = require('async')
const cliProgress = require('cli-progress')
const countries = require('i18n-iso-countries')
const dns = require('dns')
const dns2 = require('native-dns')
const firstline = require('firstline')
const fs = require('fs-extra')
const ip = require('ip')
const moment = require('moment')
const {promisify} = require('util')
const rateLimit = require('function-rate-limit')
const request = require('request-promise-native')

// Local Lib/Lists //
const redisStore = require('@lib/redis-store')
const allowedResolutions = require('@lists/allowed-resolutions.json')

// Constants //
const URL = 'myetherwallet.com'
const NAMESERVER_LIST_URL = 'https://public-dns.info/nameservers.csv'
const NAMESERVER_LIST_PATH = 'lists/public-dns-nameservers.csv'
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
    // Retrieve public nameserver list if applicable //
    await checkNameServerList()

    // Parse public nameserver file and format into array //
    let nameserverList = await fs.readFile(NAMESERVER_LIST_PATH, 'utf8')
    nameservers = await parseNameServerList(nameserverList)

    // Create Progress Bar //
    console.log(` Starting health check at ${moment().utc().toISOString()}`)
    currentProgress = 0
    progressBar = new cliProgress.Bar({
      format: ' {bar} {percentage}% | {value}/{total}'
    }, cliProgress.Presets.shades_classic)
    progressBar.start(nameservers.length, currentProgress)

    // Function that will be rate-limited //
    let fn = rateLimit(REQUESTS_PER_SECOND, 1000, function (ns) {
      checkNameServer(ns)
      // console.log(ns)
    })

    // Iterate through nameservers with rate-limited function //
    nameservers.forEach(nameserver => {
      fn(nameserver)
    }) 
  }

  /**
   * Check if a public dns nameserver list a) exists and b) is recently updated.
   * If either of these conditions is not met, then request and update the list
   */
  async function checkNameServerList() {
    try {
      let nameserverListExists = await fs.stat(NAMESERVER_LIST_PATH)
      let dateUpdated = await firstline(NAMESERVER_LIST_PATH)
      let minutesSinceUpdated = moment().diff(moment(dateUpdated), 'minutes', true)
      if(minutesSinceUpdated > 15) await requestNameServerList()
    } catch(e) {
      console.log('Updating public dns nameserver list...')
      await requestNameServerList()
    }
  }

  /**
   * Retrieve most recent nameserver list and write to file, prepended with the date it is updated
   */
  async function requestNameServerList() {
    try {
      let response = await request(NAMESERVER_LIST_URL)
      let fileContent = `${moment().utc().toISOString()}\n${response}`
      let file = await fs.writeFile(NAMESERVER_LIST_PATH, fileContent, 'utf8')
    } catch(e) {
      console.log('Error retrieving nameserver list', e)
    }
  }

  /**
   * Given a CSV-formatted string of nameservers from public DNS, parse the results into a more useable format
   * 
   * @param  {String} list - CSV-formatted string of nameservers and their corresponding information
   * @return {Array} - Array of nameservers and curated information
   */
  async function parseNameServerList(list) {
    let locations = []
    let split = list.split('\n')
    for(let i = 2; i < split.length; i++) {
      try {
        let row = split[i].replace('\r', '').split(',')
        if(row.length >= 8 && ip.isV4Format(row[0])) locations.push([row[0], row[2], row[1]]) 
      } catch(e) {
        console.log(e)
      }
    }
    return locations
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
    let entry = await redisStore.getNameServerStatus(nameserver[0])
    // console.log(entry)
  }

  return {
    init: init
  }
}()