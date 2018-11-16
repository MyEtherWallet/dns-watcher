'use strict'

// Modules //
const dns = require('dns')
const firstline = require('firstline')
const fs = require('fs-extra')
const ip = require('ip')
const moment = require('moment')
const request = require('request-promise-native')

// Constants //
const NAMESERVER_LIST_URL = 'https://public-dns.info/nameservers.csv'
const NAMESERVER_LIST_PATH = 'lists/public-dns-nameservers.csv'
const MINUTES_SINCE_LAST_UPDATE = 15

module.exports = function() {

  /**
   * Initialize, format and return Array list of Nameservers
   * 
   * @return {Array} - Array of nameserver array-objects [IP, Country Code, Name]
   */
  async function init() {
    // Retrieve public nameserver list if applicable //
    await checkNameServerList()

    // Parse public nameserver file and format into array //
    let nameserverList = await fs.readFile(NAMESERVER_LIST_PATH, 'utf8')
    return await parseNameServerList(nameserverList)
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
      if(minutesSinceUpdated > MINUTES_SINCE_LAST_UPDATE) await requestNameServerList()
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

  return {
    init
  }
}()