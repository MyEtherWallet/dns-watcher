
const dns = require('dns')
const {promisify} = require('util')
const URL = 'myetherwallet.com'
const nameserver = '1.1.185.212'

test()

async function test() {
  try {
    let resolver = new dns.Resolver()
    resolver.setServers([nameserver])
    let resolvePromise = promisify(resolver.resolve).bind(resolver)
    let addresses = await resolvePromise(URL, 'A')
    await process.nextTick
    resolver = null
    console.log(addresses)
  } catch(e) {
    console.log(e)
  }  
}