const dns = require('dns');
const npmIp = require("ip");
const _cliProgress = require('cli-progress');
const countries = require("i18n-iso-countries");

const nameservers = require("./ns_all.json");
const amzn = require("./amazon_r53.json");


const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
bar1.start(nameservers.length, 0);
const URL = "myetherwallet.com";


class Runner {
    constructor(_nameservers, _locationDb) {
        this.enableNameServerSet = true;
        this.nameservers = _nameservers || nameservers;
        this.counter = 0;
        this.NS_CACHE = {};
        this.results = {timestamp: "", good: [], bad: []};
        this.good = new Set();
        this.bad = new Set();

        this.setProgress = () => {
            this.counter++;
            bar1.update(this.counter);
            if (this.counter == this.nameservers.length) {
                this.results.timestamp = new Date().toUTCString();
                this.results.good = [...this.good];
                this.results.bad = [...this.bad];
                this.emitter ? this.emitter.emit("end", this.results) : process.exit();
            }
        };
    }

    run() {
        try {
            this.counter = 0;
            this.NS_CACHE = {};
            this.good = new Set();
            this.bad = new Set();
            this.results = {timestamp: "", good: [], bad: []};
            this.runner();
        } catch (e) {
            this.emitter ? this.emitter.emit("error", ` ERROR in run(): ${e}`) : console.error(e);
        }
    }

    setEmitter(emitter) {
        this.emitter = emitter;
    }

    addGood(ip) {
        this.good.add(ip);
    }

    addBad(ip) {
        this.bad.add(ip);
    }

    setNameservers(_nameservers) {
        if (this.enableNameServerSet) {
            this.nameservers = _nameservers;
        }

    }


    getARecords(_nameServer, _url, cb) {
        let resolver = new dns.Resolver();
        resolver.setServers([_nameServer]);
        resolver.resolve(_url, 'A', (err, addresses) => {
            cb(err, addresses);
        });
    }

    isValidRecord(addresses) {
        for (let i = 0; i < addresses.length; i++) {
            let addr = addresses[i];
            if (!this.NS_CACHE[addr]) {
                let ipValid = false;
                for (let j = 0; j < amzn.length; j++) {
                    if (npmIp.cidrSubnet(amzn[j].ip_prefix).contains(addr)) {
                        this.NS_CACHE[addr] = true;
                        ipValid = true;
                        break;
                    }
                }
                if (!ipValid) return false;
            }
        }
        return true;
    }

    runner() {
        let self = this;
        try {
            this.nameservers.forEach(function (_ns) {
                try {
                    self.getARecords(_ns[0], URL, (err, addresses) => {
                        self.setProgress();
                        if (!err) {
                            let countryName;
                            if (!self.isValidRecord(addresses)) {
                                countryName = countries.getName(_ns[1], "en");
                                self.addBad({ns: _ns[0], timestamp: new Date().toUTCString(), country: countryName, name: _ns[2]});
                                // console.error("invalid record found", _ns, addresses);
                                let invalidDetails = " NameServer Details:" +  _ns.join(", ") + ", Resolved Addresses: " + addresses.join(", ");
                                self.emitter ?  self.emitter.emit("invalidDNS", invalidDetails) : console.error(invalidDetails);

                            } else {
                                countryName = countries.getName(_ns[1], "en");
                                self.addGood({ns: _ns[0], timestamp: new Date().toUTCString(), country: countryName, name: _ns[2]});
                            }
                        }
                    })
                } catch (e) {
                    this.emitter ? this.emitter.emit("error", `INNER ERROR in runner(): ${e}`): console.error(e);
                    // logger.error(e);
                }
            })
        } catch (e) {
            this.emitter ? this.emitter.emit("error",`OUTER ERROR in runner(): ${e}`) : console.error(e);
            // if something goes wrong replace nameserver list with the internal list.
            // because we are relying on a third party for the list and if it is malformed or something we still want to be able to have a list to use
            // and we will stop the nameserver list from updating and replacing the known working list with the malformed list again.

             this.enableNameServerSet = false;
            // this.setNameservers(nameservers);
            // this.run();
        }
    }

}

module.exports = Runner;


