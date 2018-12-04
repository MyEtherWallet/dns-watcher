'use strict'

// Imports //
import pageres from 'pageres'

// Constants //
const SCREENSHOT_PATH = 'frontend/public/screenshots'
const DOMAIN = process.env.DOMAIN

// Export //
export default (() => {
  let queue = [] // Queue array
  let inProgress = false // Flag to prevent concurrent snap() instances

  /**
   * Add a nameserver to the queue in order to be screenshotted.
   * Only want to take one screenshot at a time to avoid issues.
   *
   * @param {Array} addresses - Array of addresses that a nameserver resolves to
   */
  const add = addresses => {
    addresses.forEach(ip => {
      queue.unshift(ip)
      if (!inProgress) snap()
    })
  }

  /**
   * Take a screenshot of the current nameserver IP resolution in queue.
   * Follows FIFO order.
   * If there is another item in the queue, continue, otherwise wait for one to be added.
   */
  const snap = () => {
    // Set flag to true to avoid calling snap when adding an ip to the queue //
    inProgress = true

    // Screenshot "first" item in the queue //
    let ip = queue.pop()

    // Take screenshot using pageres //
    new pageres({
      delay: 15,
      timeout: 15,
      filename: '<%= url %>-<%= size %>',
      headers: { origin: DOMAIN }
    })
      .src(`${ip}`, ['480x320'])
      .dest(SCREENSHOT_PATH)
      .run()
      .then(() => {
        inProgress = false
        if (queue.length > 0) snap()
      })
      .catch(e => {
        // SET DEFAULT PIC //
        inProgress = false
        if (queue.length > 0) snap()
      })
  }

  return {
    add
  }
})()
