'use strict'

// Modules //
import async from 'async'
import countries from 'i18n-iso-countries'
import dns from 'dns'
import {EventEmitter} from 'events'
import ip from 'ip'
import moment from 'moment'
import momentDurationFormatSetup from 'moment-duration-format'
import {promisify} from 'util'
import rateLimit from 'function-rate-limit'

// Local Lib/Lists //
import allowedResolutions from '@lists/allowed-resolutions.json'
import nameserverList from '@lib/nameserver-list'
import progressBar from '@lib/progress-bar'
import redisStore from '@lib/redis-store'

// Constants //
const DOMAIN = process.env.DOMAIN
const REQUESTS_PER_SECOND = 50
const BATCH_SIZE = 500

// Export //
export default (() => {

  let nameservers = [] // Array of nameservers
  let emitter = new EventEmitter() // Event emitter... obviously

  /**
   * Initialization function
   * Retrieve list of nameservers and systematically check each one
   * Update Redis entries with the status of each nameserver
   */
  const init = async () => {
    console.log(`\n Performing Health Check at ${moment().utc().toISOString()}...`)

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
  const queue = async () => {
    // Pull array of BATCH_SIZE from nameservers array //
    let currentQueue = nameservers.splice(0, BATCH_SIZE)

    // Function that will be rate-limited //
    let fn = rateLimit(REQUESTS_PER_SECOND, 1000, async (ns, done) => {
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
   * If there is an invalid entry, emit an "invalid" event with nameserver payload
   * 
   * @param  {Array} - Nameserver info array
   */
  const checkNameServer = async (nameserver) => {
    try {
      let nameserverAddress = nameserver[0]
      let addresses = await getARecords(nameserverAddress)
      if(addresses){
        let isValid = isValidRecord(addresses)
        updateRedisEntry(nameserver, addresses, isValid)
        if(!isValid) emitter.emit('invalid', {nameserver: nameserver[0], addresses: addresses})
      }
    } catch(e) {
      console.log(e)
    }
  }

  /**
   * Given a nameserver, attempt to resolve/obtain a list of A record addresses associated with the global DOMAIN name
   * 
   * @param  {String} nameserver - IP address of a particular nameserver
   * @return {Array} List of A records associated with the DOMAIN according to this particular nameserver 
   */
  const getARecords = async (nameserver) => {
    try {
      let resolver = new dns.Resolver()
      resolver.setServers([nameserver])
      let resolvePromise = promisify(resolver.resolve).bind(resolver)
      let addresses = await resolvePromise(DOMAIN, 'A')
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
  const isValidRecord = (addresses) => {
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
   * @param  {Array}  addresses  - Resolved addresses of DOMAIN for this particular nameserver
   * @param  {Boolean} isValid - Whether or not nameserver is confirmed to resolve correctly
   */
  const updateRedisEntry = async (nameserver, addresses, isValid) => {
    await redisStore.setNameServerStatus(nameserver[0], {
      ns: nameserver[0],
      name: nameserver[2],
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
})()