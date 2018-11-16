'use strict'

const cliProgress = require('cli-progress')

module.exports = function(){

  let bar // cli-progress bar object
  let max // Total progress entries
  let current // Current progress entry counter

  /**
   * Initialize cli-progress bar given a @total number of entries
   * 
   * @param  {Integer} total - Number of entries (typically the number of nameservers)
   */
  function init(total) {
    max = total
    current = 0
    bar = new cliProgress.Bar({
      format: ' {bar} {percentage}% | {value}/{total}'
    }, cliProgress.Presets.shades_classic)
    bar.start(max, current)
  }

  /**
   * Update the cli-progress bar.
   * This will increase the current entry counter and update the gui.
   */
  async function update() {
    current++
    if(current <= max) bar.update(current)
  }

  return {
    init,
    update
  }
}()