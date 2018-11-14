'use strict'

// See: https://www.npmjs.com/package/module-alias //
require('module-alias/register')

const hc = require('@lib/health-check')

hc.init()