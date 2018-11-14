'use strict'

const async = require('async')
const countries = require('i18n-iso-countries')
const dns = require('dns')
const ip = require('ip')
const {promisify} = require('util')
const redisStore = require('@lib/redis-store')
const allowedResolutions = require('@lists/allowed-resolutions.json')
const nameservers = require('@lists/nameservers.json')

const URL = 'myetherwallet.com'

module.exports = function(){

  async function init() {
    nameservers.forEach(nameserver => {
      console.log(nameserver[0])
      checkNameServer(nameserver)
    })
  }

  /**
   * Perform "health check" on a given nameserver entry and update Redis with the results
   * 
   * @param  {Array} - Nameserver info array
   */
  async function checkNameServer(nameserver) {
    let addresses = await getARecords(nameserver[0])
    let isValid = isValidRecord(addresses)
    updateRedisEntry(nameserver, addresses, isValid)
  }

  /**
   * Given a nameserver, attempt to resolve/obtain a list of A record addresses associated with the global URL name
   * 
   * @param  {String} nameserver - IP address of a particular nameserver
   * @return {Array} List of A records associated with the URL according to this particular nameserver 
   */
  async function getARecords(nameserver) {
    let resolver = new dns.Resolver()
    resolver.setServers([nameserver])
    let resolvePromise = promisify(resolver.resolve).bind(resolver)
    let addresses = await resolvePromise(URL, 'A')
    return addresses
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
    redisStore.setNameServerStatus(nameserver, {
      ns: nameserver[0],
      timestamp: new Date().toUTCString(),
      status: isValid,
      country: countries.getName(nameserver[1], 'en'),
      countryShort: nameserver[1],
      resolved: addresses
    })
  }

  return {
    init: init
  }
}()