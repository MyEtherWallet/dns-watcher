'use strict'

// See: https://www.npmjs.com/package/module-alias //
require('module-alias/register')

// https://stackoverflow.com/questions/10777657/node-js-dns-lookup-how-to-set-timeout //
const hc = require('@lib/health-check')
// hc.init()

// const rs = require('@lib/redis-store')

// async function b() {
//   let a = await rs.getAllNameServerStatus()
//   console.log(a)
// }

// b()
// 
const jg = require('@lib/json-generator')

async function b() {
  await jg.init()
}

b()