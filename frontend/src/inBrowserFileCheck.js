const request = require('request-promise-native')

/**
 * Check the integrity of a project to ensure that the files on an official Github repo match those of a production website.
 * This function first recursively gets all of the files within the project via Github, and then checks each file against what should
 * be the production website.
 * 
 * @return {Promise} - Resolves to true if all files match, false otherwise
 */
export default async function fileCheck(forceKey) {
  const github = process.env.GITHUB_SITE || 'https://api.github.com/repos/kvhnuke/etherwallet/contents?ref=gh-pages'
  const site = process.env.PRODUCTION_SITE || 'https://www.myetherwallet.com'
  const key = process.env.FORCE_KEY

  return new Promise(async (resolve, reject) => {
    let githubFiles
    try {
      if (forceKey && forceKey === key) {
        githubFiles = await getGithubFiles(github)
      } else {
        githubFiles = await getGithubFilesLocal()
        if (githubFiles === null) githubFiles = await getGithubFiles(github) 
      }
      let isKosher = await compareFiles(githubFiles)
      console.log('Koshe?', isKosher)
      resolve(isKosher)
    } catch (e) {
      console.log(e)
      resolve(false)
    }
  })

  /**
   * Return server-side cache of github files. The server cache utilizes the getGithubFiles() implementation below.
   * 
   * @return {Array} - Array of files in the following format: File{ path: '...', url: '...' }
   */
  async function getGithubFilesLocal() {
    let host = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '')
    let files = await request({ uri: `${host}/github-files`, json: true })
    return files
  }

  /**
   * Given the URL of a github-api endpoint listing files of a particular project,
   * or a directory within that project, recursively retrieve the path and URL or each
   * file within the parent directory and its children's directories.
   * 
   * @param  {String} url - URL of github api endpoint, ala https://api.github.com/repos/kvhnuke/etherwallet/contents?ref=gh-pages
   * @return {Array} - Array of files in the following format: File{ path: '...', url: '...' }
   */
  async function getGithubFiles(url, files = []) {
    let tree = await request({ uri: url, json: true })
    await asyncForEach(tree, async obj => {
      if(obj.type === 'file') {
        files.push({
          path: obj.path,
          url: obj.download_url
        })
      }
      if(obj.type === 'dir') {
        await getGithubFiles(obj._links.self, files)
      }
    })
    return files
  }

  /**
   * Compare each of the files found in getGithubFiles to production site resolutions.
   * If any of the files do not match, return false, otherwise return true.
   *
   * @param {Array} files - Array of files (compiled with getGithubFiles())
   * @return {Boolean} - True if all files match, false if not
   */
  async function compareFiles(files) {
    let result = true
    await asyncForEach(files, async file => {
      let githubResult = await request(file.url)
      try {
        // Strip site of trailing slash (/) just in case, and compare results //
        let siteResult = await request(`${site.replace(/\/$/, '')}/${file.path}?q=${Date.now()}`)
        if (githubResult !== siteResult) {
          console.log('nope', file.path)
          result = false
        }
      } catch (e) {
        console.log('e', e)
        result = false
      }
    })
    return result
  }
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