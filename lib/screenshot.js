'use strict'

const pageres = require('pageres')

module.exports = function() {

  let queue = [] // Queue array
  let inProgress = false // Flag to prevent concurrent snap() instances

  /**
   * Add a nameserver to the queue in order to be screenshotted.
   * Only want to take one screenshot at a time to avoid issues.
   * 
   * @param {String} ip - IP of the nameserver
   */
  function add(ip) {
    queue.unshift(ip)
    // if(!inProgress) snap()
    // console.log(queue)
  }

  /**
   * Take a screenshot of the current nameserver IP resolution in queue.
   * Follows FIFO order.
   * If there is another item in the queue, continue, otherwise wait for one to be added.
   */
  function snap() {
    // Set flag to true to avoid calling snap when adding an ip to the queue //
    inProgress = true
    console.log(queue)

    // Screenshot "first" item in the queue //
    let ip = queue.pop()
    new pageres({
      delay: 2,
      timeout: 5,
      filename: '<%= url %>-<%= size %>',
      headers: {origin: 'myetherwallet.com'}
    })
    .src(`${ip}`, ['480x320'])
    .dest('screenshots')
    .run()
    .then(() => {
      inProgress = false
      if(queue.length > 0) snap()
    })
    .catch((e) => {
      inProgress = false
      if(queue.length > 0) snap()
    })
  }

  return {
    add: add
  }
}()