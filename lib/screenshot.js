'use strict'

const pageres = require('pageres')

module.exports = async function(nameserver) {
  // console.log('Taking screenshot for ', nameserver)
  try {
    new pageres({
      delay: 2,
      timeout: 20,
      filename: '<%= url %>-<%= size %>',
      headers: {origin: 'www.myetherwallet.com'}
    })
    .src(`${nameserver}`, ['480x320'])
    .dest('screenshots')
    .run()
  } catch(e) {
    // console.log('Err, copy placeholder...')
  }
}