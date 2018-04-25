const dns = require('dns');
const npmIp = require("ip");
const _cliProgress = require('cli-progress');
const countries = require("i18n-iso-countries");

const logger = require("./logger");
const nameservers = require("./ns_all");
const amzn = require("./amazon_r53");


const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
// bar1.start(nameservers.length, 0);
const URL = "myetherwallet.com";


class Runner {
    constructor(_nameservers, _amzn, _runOptions) {
        this.enableNameServerSet = true;
        this.nameservers = _nameservers || [];
        this.amzn = _amzn || [];
        this.counter = 0;
        this.count = 0;
        this.runComplete = false;
        this.batchSize = _runOptions.batchSize || 0;
        this.batchCount = 0;
        this.NS_CACHE = {};
        this.results = {timestamp: "", good: [], bad: []};
        this.good = new Set();
        this.bad = new Set();

        this.setProgress = () => {
            this.counter++;
            bar1.update(this.counter);
            if (this.counter == this.nameservers.length) {
                this.emitter ? this.emitter.emit("end", {
                    timestamp: new Date().toUTCString(),
                    good: [...this.good],
                    bad: [...this.bad]
                }) : process.exit();
            }
        };
    }

    batchTracker() {
        if (!this.runComplete) {
            this.count += 1;
            this.batchCount += 1;
            console.log(this.batchCount);
            if (this.batchCount >= parseInt(this.batchLength * 0.9)) {
                this.nextBatch();
            }
        }
    }


    nextBatch() {
        if (!this.runComplete) {
            if (this.count < this.nameservers.length - 1 && !(this.count > this.nameservers.length * 2)) {
                this.batchCount = 0;
                console.log("RUN NEXT BATCH", this.count); //todo remove dev item
                this.runner(this.nameservers.slice(this.count, this.count + this.batchSize));
                // count += 10;
            } else {
                // runner.emit("sendResults");
                this.runComplete = true;
            }
        }
        // this.runner(nameservers.slice(count, count + this.batchSize));
    }

    run(_nameservers) {
        if (_nameservers) this.nameservers = _nameservers;
        try {
            this.count = 0;
            this.runComplete = false;
            this.counter = 0;
            this.NS_CACHE = {};
            // this.good = new Set();
            // this.bad = new Set();
            this.good = [];
            this.bad = [];
            this.results = {timestamp: "", good: [], bad: []};
            // this.runner();
            this.runner(this.nameservers.slice(0, this.batchSize));
        } catch (e) {
            logger.error(e);
            this.emitter.emit("error");
        }
    }

    setEmitter(emitter) {
        this.emitter = emitter;
    }

    addGood(ip) {
        // this.good.add(ip);
        this.good.push(ip);
    }

    addBad(ip) {
        // this.bad.add(ip);
        this.bad.push(ip);
    }

    setNameservers(_nameservers) {
        console.log(_nameservers.length); //todo remove dev item
        if (this.enableNameServerSet) {
            this.nameservers = _nameservers;
        }

    }


    getARecords(_nameServer, _url) {
        return new Promise((resolve, reject) => {
            // console.log("---", _nameServer, _url); //todo remove dev item
            let resolver = new dns.Resolver();
            resolver.setServers([_nameServer]);
            resolver.resolve(_url, 'A', (err, addresses) => {
                if(err) reject(err);
                else resolve(addresses);
            });
        });
    }

    isValidRecord(addresses) {
        for (let i = 0; i < addresses.length; i++) {
            let addr = addresses[i];
            if (!this.NS_CACHE[addr]) {
                let ipValid = false;
                for (let j = 0; j < this.amzn.length; j++) {
                    if (npmIp.cidrSubnet(this.amzn[j].ip_prefix).contains(addr)) {
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

    runner(_nameServers) {
        // let self = this;
        this.batchLength = _nameServers.length;
        try {
            // console.log(this.nameservers); //todo remove dev item
            // _nameServers.forEach(function (_ns) {
                for(let i=0; i<_nameServers.length; i++){
                try {
                    // console.log(_ns); //todo remove dev item
                    this.getARecords(_nameServers[0], URL)
                        .then(addresses => {
                            this.setProgress();
                            let countryName;
                            if (!this.isValidRecord(addresses)) {
                                countryName = countries.getName(_nameServers[1], "en");
                                // console.log(_ns[0], _ns[1]); //todo remove dev item
                                // self.addBad({ns: _ns[0], timestamp: new Date().toUTCString(), country: countryName, serverName: _ns[1]});
                                this.addBad(this.counter);
                                // console.error("invalid record found", _ns, addresses);
                                // logger.error("invalid record found: ");
                                // logger.error(" - nameserver details:", _ns, ", resolved addresses: ", addresses);
                                this.batchTracker();
                            } else {
                                countryName = countries.getName(_ns[1], "en");
                                // self.addGood({ns: _ns[0], timestamp: new Date().toUTCString(), country: countryName, serverName: _ns[1]});
                                this.addGood(this.counter);
                                this.batchTracker();
                            }
                        })
                        .catch( err => {
                            this.setProgress();
                            this.batchTracker();
                        })
                    // self.getARecords(_ns[0], URL, (err, addresses) => {
                    //     try {
                    //         self.setProgress();
                    //         if (!err) {
                    //             let countryName;
                    //             if (!self.isValidRecord(addresses)) {
                    //                 countryName = countries.getName(_ns[1], "en");
                    //                 // console.log(_ns[0], _ns[1]); //todo remove dev item
                    //                 // self.addBad({ns: _ns[0], timestamp: new Date().toUTCString(), country: countryName, serverName: _ns[1]});
                    //                 self.addBad(self.counter);
                    //                 // console.error("invalid record found", _ns, addresses);
                    //                 logger.error("invalid record found: ");
                    //                 logger.error(" - nameserver details:", _ns, ", resolved addresses: ", addresses);
                    //                 self.batchTracker();
                    //             } else {
                    //                 countryName = countries.getName(_ns[1], "en");
                    //                 // self.addGood({ns: _ns[0], timestamp: new Date().toUTCString(), country: countryName, serverName: _ns[1]});
                    //                 self.addGood(self.counter);
                    //                 self.batchTracker();
                    //             }
                    //         }
                    //         if (err) {
                    //             self.batchTracker();
                    //         }
                    //     } catch (e) {
                    //         console.error("INNER INNER ERROR in runner():", e);
                    //     }
                    // })
                } catch (e) {
                    console.error("INNER ERROR in runner():", e);
                    // logger.error("INNER ERROR in runner():", e);
                    // logger.error(e);
                }
            }//)
        } catch (e) {
            console.error("OUTER ERROR in runner():", e);
            // logger.error("OUTER ERROR in runner():", e);
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


