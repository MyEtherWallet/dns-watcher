const dns = require('dns');
const npmIp = require("ip");
const ns = require("./ns_all.json");
const amzn = require("./amazon_r53.json");
const _cliProgress = require('cli-progress');
const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
bar1.start(ns.length, 0);
var counter = 0;
const URL = "myetherwallet.com";
let NS_CACHE = {};
var setProgress = () => {
    counter++
    bar1.update(counter);
    if (counter == ns.length) process.exit();
}

function getARecords(_nameServer, _url, cb) {
    let resolver = new dns.Resolver();
    resolver.setServers([_nameServer]);
    resolver.resolve(_url, 'A', (err, addresses) => {
        cb(err, addresses);
    });
}

function isValidRecord(addresses) {
    for (let i = 0; i < addresses.length; i++) {
        let addr = addresses[i];
        if (!NS_CACHE[addr]) {
            let ipValid = false;
            for (let j = 0; j < amzn.length; j++) {
                if (npmIp.cidrSubnet(amzn[j].ip_prefix).contains(addr)) {
                    NS_CACHE[addr] = true;
                    ipValid = true;
                    break;
                }
            }
            if (!ipValid) return false;
        }
    }
    return true;
}

function runner() {
    ns.forEach(function(_ns) {
        getARecords(_ns, URL, (err, addresses) => {
            setProgress();
            if (!err) {
                if (!isValidRecord(addresses)) {
                    console.error("invalid record found", _ns, addresses)
                }
            }
        })
    })
}
runner()