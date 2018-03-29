const events = require('events');
const dns = require('./dns');
const fs = require("fs");
const npmIp = require("ip");

const ns = require("./ns_all.json");
const amzn = require("./amazonPreFixes");

let dnsAlert = new events.EventEmitter();

const url = "myetherwallet.com";

let errorFile = "errors.json";
let logfile = "dnsError.json";
let dnsErrorCount = 0;
let errorStart = true;

let idx = 5800;
let batch = ns.slice(0, idx);
watch(batch);


dnsAlert.on("invalidDNS", (data) =>{
    // do something with data.
});

function watch(batch) {
    appendRunStart(errorFile);
    for (let i = 0; i < batch.length; i++) {
        try {
            dnsResolve(batch[i], i)
                .then((result) => {
                    doCheck(result, ip);
                    popPush();
                })
                .catch((err) => {
                    try {
                        console.log(err);
                        appendToFile(errorFile, {error: err.err, IP: err.ip}, errorStart);
                        errorStart = false;
                    } catch (e) {
                        console.log(e);
                    }
                    popPush();
                });
        } catch (e) {
            console.log(e);
            popPush();
        }
    }

    // }
}

function popPush() {
    if (ns.length < (idx + 1)) {
        // idx = 0;
    } else {
        let ip = ns[++idx];
        try {
            dnsResolve(ip, idx)
                .then((result) => {

                    doCheck(result, ip);
                    popPush();
                })
                .catch((err) => {
                    try {
                        console.log(err);
                        appendToFile(errorFile, {error: err.err, IP: err.ip}, errorStart);
                        errorStart = false;
                    } catch (e) {
                        console.log(e);
                    }
                    popPush();
                });
        } catch (e) {
            console.log(e);
            popPush();
        }
    }

}


function doCheck(result, ip) {
    checker(result, (isOk) => {
        if (!isOk) {
            console.error("NOT OK");
            dnsAlert.emit("invalidDNS", {ip: ip});
            dnsErrorCount = dnsErrorCount + 1;
            if (dnsErrorCount === 0) {
                appendRunStart(logfile);
                appendToFile(logfile, ip, true);
            } else {
                appendToFile(logfile, ip);
            }

        }
        popPush();
    });
}

function dnsResolve(ip, i) {
    return new Promise((resolve, reject) => {
        let start = Date.now();
        let resolver = new dns.Resolver();
        resolver.setServers([ip]);
        // This request will use the server at 4.4.4.4, independent of global settings.
        resolver.resolve(url, 'A', (err, addresses) => {
            console.log(resolver.getServers());
            let delta = (Date.now()) - start;
            if (err) {
                reject({err: err, index: i, time: delta, ip: ip});
            }
            resolve({addresses: addresses, index: i,time: delta, ip: ip});
        });

    })

}


process.on("exit", () => {
    console.log(idx);
    appendRunEnd(errorFile);
    if (dnsErrorCount !== 0) {
        appendRunEnd(logfile);
    }
});

function checker(result, callback) {
    let record = [];
    // need a more efficient routine here
    result.addresses.forEach((addr) => {
        let ipSplit = addr.split(".");
        amzn[ipSplit[0]].forEach(amz => {
            record.push(npmIp.cidrSubnet(amz).contains(addr));
        })
    });
    if (record.indexOf(true) <= -1) {
        callback(false);
    } else {
        callback(true);
    }
}





function appendToFile(fileName, json, begin) {
    if (begin) {
        fs.appendFile(fileName, JSON.stringify(json), (err) => {
            if (err) throw err;
        });
    } else {
        fs.appendFile(fileName, ',\n' + JSON.stringify(json), (err) => {
            if (err) throw err;
        });
    }
}

function appendRunStart(fileName) {
    let date = new Date();
    let time = date.getTime();
    fs.appendFile(fileName, '{"start":' + time + ', "errors":' + '[\n', (err) => {
        if (err) throw err;
    });
}

function appendRunEnd(fileName) {
    fs.appendFileSync(fileName, ']},\n', (err) => {
        if (err) throw err;
    });
}

/*

function sortErrors(error) {
    switch (error) {
        case "ETIMEOUT":
            break;
        case "EREFUSED":
            break;
        case "ESERVFAIL":
            break;
        default:
            break;

    }
}

*/

