'use strict'

const dotenv = require('dotenv')
const fs = require('fs-extra')
const ROOT_ENV_PATH = '.env'
const VUE_ENV_PATH = 'frontend/.env.production'

/**
 * Generate vue-cli v3 friendly .env file for production
 *
 * See:
 * https://cli.vuejs.org/guide/mode-and-env.html
 * https://stackoverflow.com/questions/50828904/using-environment-variables-with-vue-js
 * https://forum.vuejs.org/t/vue-cli-3-define-environment-variable-and-use-it-as-axios-baseurl/36837
 */
!async function(){
  // Content string to write to vue .env file //
  let content = ''

  // Read .env file and parse into object //
  let env = await fs.readFile(ROOT_ENV_PATH, 'utf8')
  let parsedEnv = dotenv.parse(env)

  // Iterate through each .env variable to generate VUE_APP_ string //
  Object.keys(parsedEnv).forEach(function(key) {
    let value = parsedEnv[key]
    let vueKey = `VUE_APP_${key}`
    content += `${vueKey}=${value}\n`
  })

  // Write to file //
  await fs.writeFile(VUE_ENV_PATH, content, 'utf8')
}()
