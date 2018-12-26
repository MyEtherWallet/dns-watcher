'use strict'

// Imports //
import webshot from 'webshot'

// Constants //
const SCREENSHOT_PATH = 'frontend/dist/screenshots'
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
    if(!Array.isArray(addresses)) addresses = [addresses]
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
    try {
      // Set flag to true to avoid calling snap when adding an ip to the queue //
      inProgress = true

      // Screenshot "first" item in the queue //
      let ip = queue.pop()

      // Take screenshot using webshot //
      console.log('Taking screenshot...', ip)
      webshot(`${ip}`, `${SCREENSHOT_PATH}/${ip}.png`, {
        renderDelay: 1000 * 10,
        timeout: 1000 * 15, 
        customHeaders: {
          'ORIGIN': process.env.DOMAIN
        }
      }, (err) => {
        if(err) {
           console.log('Screenshot Failed...', err)
        }
        console.log('Screenshot Taken!', `${SCREENSHOT_PATH}/${ip}.png`)
        inProgress = false
        if (queue.length > 0) snap()
      })
    } catch (e) {
      console.log('\nError taking snapshot:', e)
      if (queue.length > 0) snap()
    }
  }

  return {
    add
  }
})()
