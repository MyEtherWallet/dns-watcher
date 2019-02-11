'use strict'

// Imports //
import request from 'request-promise-native'
import schedule from 'node-schedule'
import fileExtension from 'file-extension'

// Libs //
import redisStore from '@lib/redis-store'

const ALLOWED_EXTENSIONS = ['js', 'html']

// Export //
export default (() => {
  let scheduledTask

  const init = () => {
    getAndSaveFiles()
    scheduledTask = schedule.scheduleJob('0 * * * *', () => {
      getAndSaveFiles()  
    })
  }

  const getAndSaveFiles = async () => {
    console.log('Updating Github Files List... ')
    let githubFiles = await getGithubFiles(process.env.GITHUB_SITE)
    await redisStore.setGithubFiles(githubFiles)
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
    init
  }
})()
