'use strict'

// See: https://www.npmjs.com/package/module-alias //
require('module-alias/register')

const rs = require('@lib/redis-store')

rs.setNameServerStatus('test', {'hi': 'lala'})

rs.getNameServerStatus('test')
  .then(data => {
    console.log(data)
  })

