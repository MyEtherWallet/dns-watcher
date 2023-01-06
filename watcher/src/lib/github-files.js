'use strict'

// Imports //
import request from 'request-promise-native'
import schedule from 'node-schedule'
import { EventEmitter } from 'events'
import fileExtension from 'file-extension'

// Libs //
import redisStore from '@lib/redis-store'
import telegramBot from '@lib/telegram-bot'
import twilioBot from '@lib/twilio-bot'

const ALLOWED_EXTENSIONS = ['js', 'html']

// Export //
export default (() => {
  let scheduledTask

  const init = () => {
    getAndSaveFiles()
    scheduledTask = schedule.scheduleJob('0,15,30,45 * * * *', () => {
      getAndSaveFiles()  
    })
  }

  const force = () => {
    getAndSaveFiles()
  }

  const getAndSaveFiles = async () => {
    console.log('Updating Github Files List... ')
    let githubFiles = await getGithubFiles(process.env.GITHUB_SITE)
    if (githubFiles === null) {
      return setTimeout(() => {
        init()
      }, 60 * 1000)
    }
    await redisStore.setGithubFiles(githubFiles)
    await compareFiles(githubFiles)
  }

  /**
   * Given the URL of a github-api endpoint listing files of a particular project,
   * or a directory within that project, recursively retrieve the path and URL or each
   * file within the parent directory and its children's directories.
   *
   * Only store/cache files of ALLOWED_EXTENSIONS defined above.
   * 
   * @param  {String} url - URL of github api endpoint, ala https://api.github.com/repos/kvhnuke/etherwallet/contents?ref=gh-pages
   * @return {Array} - Array of files in the following format: File{ path: '...', url: '...' }
   */
  const getGithubFiles = async (url, files = []) => {
    let tree = await request({ 
      uri: url,
      json: true,
      headers: {
        'User-Agent': 'dns-watcher'
      }
    })
    await asyncForEach(tree, async obj => {
      if(obj.type === 'file') {
        const file_extension = fileExtension(obj.path)
        if (ALLOWED_EXTENSIONS.indexOf(file_extension) > -1) {
          files.push({
            path: obj.path,
            url: obj.download_url
          })
        }
      }
      if(obj.type === 'dir') {
        await getGithubFiles(obj._links.self, files)
      }
    })
    return files
  }

  /**
   * Compare each of the files found in getGithubFiles to production site resolutions.
   * If any of the files do not match, send telegram message with list of files.
   *
   * @param {Array} files - Array of files (compiled with getGithubFiles())
   */
  const compareFiles = async (files) => {
    let result = true
    let mismatchedFiles = []
    await asyncForEach(files, async file => {
      let githubResult = await request(file.url)
      try {
        // Strip site of trailing slash (/) just in case, and compare results //
        let siteResult = await request(`${process.env.PRODUCTION_SITE.replace(/\/$/, '')}/${file.path}?q=${Date.now()}`)
        if (githubResult !== siteResult) {
          result = false
          mismatchedFiles.push(file.path)
        }
      } catch (e) {
        console.log('e', e)
        console.log('statusCode:', e.statusCode)

        // Ignore //
        if (e.statusCode) {
          if (
            parseInt(e.statusCode) === 524 ||
            parseInt(e.statusCode) === 522 ||
            parseInt(e.statusCode === 520)
          ) {
            return
          }
          // statusCodeError = true
          // unreachableFiles.push(file.path)
          let message = `MEW ${e.statusCode} Error:\n\n`
          message += `${file.path}\n`
          await telegramBot.send(message)
          await twilioBot.phoneAlert()            
        }
      }
    })

    // Send message if mismatched files //
    if (result === false) {
      let message = 'MEW File Mismatch:\n\n'
      mismatchedFiles.forEach(file => {
        message += `${file}\n`
      })
      await telegramBot.send(message)
      await twilioBot.phoneAlert() 
    }

    // Send message if any files are unreachable //
    // if (statusCodeError === true) {
    //   let message = 'MEW 522 Error:\n\n'
    //   unreachableFiles.forEach(file => {
    //     message += `${file}\n`
    //   })
    //   await telegramBot.send(message)
    // }
  }

  /**
   * Polyfill for async-style forEach loop.
   * 
   * Example: 
   *
   * await asyncForEach(foo, async bar => {
   *   await baz(bar)
   * })
   * 
   * @param  {Array} array - Array to iterate through
   * @param  {Function} callback - Asynchronous function to perform
   */
  const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }

  return {
    init,
    force
  }
})()
