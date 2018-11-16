'use strict'

// See: https://www.npmjs.com/package/module-alias //
require('module-alias/register')

// https://stackoverflow.com/questions/10777657/node-js-dns-lookup-how-to-set-timeout //
const hc = require('@lib/health-check')
hc.init()
