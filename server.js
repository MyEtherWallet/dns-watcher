require("dotenv").config();
const fs = require("fs");
const path = require("path");
// const events = require("events");
const express = require("express");
const http = require("http");
const clone = require("clone");
const request = require("request-promise-native");
const _cliProgress = require('cli-progress');

const Runner = require("./runner");
const nameservers = require("./ns_all");
const amzn = require("./amazon_r53");
const countryListing = require("./country_List");
const logger = require("./logger");

const runner = new Runner(nameservers, amzn);
const app = express();

// const bar2 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_grey);
const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
// const emitter = new events.EventEmitter();

const DNS_LIST_URL = process.env.DNS_LIST_URL || "https://public-dns.info/nameservers.csv";
// runner.setEmitter(emitter);

let locations = [];
let chunks = [];
let count = 0;
let batchSize = 5000;
// const waitBetweenRuns = 100000;
const waitBetweenRuns = 10000;
let runComplete = false;
/**
 * Define the chunk method in the prototype of an array
 * that returns an array with arrays of the given size.
 *
 * @param chunkSize {Integer} Size of every group
 */
Object.defineProperty(Array.prototype, 'chunk', {
    value: function (chunkSize) {
        var temporal = [];

        for (var i = 0; i < this.length; i += chunkSize) {
            temporal.push(this.slice(i, i + chunkSize));
        }

        return temporal;
    }
});

// const options = {
//     key: fs.readFileSync(path.join(__dirname, process.env.HTTPS_KEY_FILE)),
//     cert: fs.readFileSync(path.join(__dirname, process.env.HTTPS_CERT_FILE)),
//     rejectUnauthorized: process.env.STATUS === "production"
// };

const server = http.createServer(app);

const port = process.env.PORT || 3000;


function getAndParseDNSList() {
    return request(DNS_LIST_URL)
        .then(result => {
            locations = [];
            let split = result.split("\n");
            logger.info("Updating NameServer list. Restarting Run.");
            for (let i = 1; i < split.length; i++) {
                try {
                    let row = split[i].replace("\r", "").split(",");
                    if (row.length >= 8) locations.push([row[0], row[2], row[1]]);

                } catch (e) {
                    logger.error(e);
                    throw e;
                }
            }

            split = [];
            return locations;
        })
}

server.listen(port, () => {
    console.log(`Server Listening on Port ${port}`);
    getAndParseDNSList()
        .then(() => {
            // chunks = next.chunk(10000);
            runner.emit("start");
            // chunks.forEach(function(_chunk){
            //     // runner.setNameservers();
            //     runner.runner(_chunk);
            // });
            logger.info("Initial Run Start");

        })
        .catch(err => {
            logger.error(err);
        })
});


app.use("/static", express.static(path.join(__dirname, "MewChecker/dist/static")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "MewChecker/dist/index.html"));
});

app.get("/country-list", (req, res) => {
    res.send(countryListing.name);
});

app.get("/dns-report", (req, res) => {
    let filepath = path.join(__dirname, process.env.DNS_RESULT_FILE);
    try {
        fs.access(filepath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
            if (err) {
                res.send("{\"timestamp\": \"" + new Date().toUTCString() + "\",\"good\":[\"building initial list\"], \"bad\":[\"building initial list\"]}");
            } else {
                res.sendFile(filepath);
            }
        });
    } catch (e) {
        logger.error(e);
    }
});

app.get("/new-results", (req, res) => {
    let filepath = path.join(__dirname, process.env.DNS_RESULT_FILE);
    try {
        fs.access(filepath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
            if (err) {
                res.send("{\"timestamp\": \"" + new Date().toUTCString() + "\",\"good\":[\"building initial list\"], \"bad\":[\"building initial list\"]}");
            } else {
                fs.readFile(filepath, "utf-8", (err, result) => {
                    try {
                        if (err) throw err;
                        let jsonResult = JSON.parse(result);
                        let displayedList = req.query.timestamp;
                        let currentList = Date.parse(jsonResult.timestamp);
                        if (+currentList > +displayedList) {
                            res.send({result: true});
                        } else {
                            res.send({result: false});
                        }
                    } catch (e) {
                        logger.error(e);
                    }
                })
            }
        });
    } catch (e) {
        logger.error(e);
    }
});

// 404 handlerish
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    if (!/favicon/.test(req.originalUrl)) logger.warn(`INVALID ROUTING ATTEMPT: {hostname: ${req.hostname}, ip: ${req.ip}, originalUrl: ${req.originalUrl}, error: ${err}}`);
    res.status(err.status || 500);
});


runner.on("start", (bkupList) => {

    if(bkupList){
        console.log(bkupList); //todo remove dev item
        locations = bkupList;
    }
    // let chunks = locations.chunk(10);
    // chunks.forEach(function(_chunk){
    //     // runner.setNameservers();
    //     runner.runner(_chunk);
    // });
    runComplete = false;
    runner.prependOnceListener("end", handleResultsAndRestart);
    bar1.start(locations.length, 0);
    console.log("starting");
    count = 0;
    runner.runner(locations.slice(count, count + batchSize));
});

let batchCount = 0;
let batchLength = 0;
let endRunCountDown = false;

runner.on("nextBatch", () => {
    batchCount = 0;
    if(!runComplete){
        if (count < locations.length - 1 && !(count > locations.length * 2)) {
            console.log("RUN NEXT BATCH", count); //todo remove dev item
            runner.runner(locations.slice(count, count + batchSize));
            // count += 10;
        } else {
            runner.emit("sendResults");
            runComplete = true;
        }
        // likely hung up or some responses were lost. wait a second then send results and wait for restart
        if (count > parseInt(batchLength * 0.98) && !endRunCountDown) {
            endRunCountDown = true;
            setTimeout(() => {
                count = locations.length * 3;
                runComplete = true;
                runner.emit("sendResults");
            }, 1000)
        }
    }

});


// runner.on("end",);


runner.on("batch", () => {
    if (!runComplete) {
        count += 1;
        batchCount += 1;
        bar1.increment();
        // bar2.increment();
        if (batchCount >= parseInt(batchLength * 0.9)) {
            runner.emit("nextBatch");
        }
    }
    // console.log("batch complete count: ", batchCount, batchLength);
});

runner.on("BadBatch", () => {
    if (!runComplete) {
        batchCount += 1;
        count += 1;
        bar1.increment();
        // bar2.increment();
        if (batchCount >= parseInt(batchLength * 0.9)) {
            runner.emit("nextBatch");
        }
    }
    // console.log("BadBatch complete count: ", batchCount, batchLength);
});

runner.on("timeoutBatch", () => {
    if (!runComplete) {
        count += 1;
        batchCount += 1;
        bar1.increment();
        // bar2.increment();
        if (batchCount >= parseInt(batchLength * 0.9)) {
            runner.emit("nextBatch");
        }
    }
    // console.log("timeoutBatch complete count: ", batchCount, batchLength);
});

runner.on("nsLength", (len) => {
    batchLength = len;
    console.log(batchLength); //todo remove dev item
    // bar2.start(len, 0);
});



function handleResultsAndRestart (results) {
    //todo uncomment after dev
    logger.info("Run Complete.");
    runComplete = true;
    let backupNameServerList = clone(locations);
    fs.writeFileSync(path.join(__dirname, process.env.DNS_RESULT_FILE), JSON.stringify(results), (error) => {
        if (error) {
            logger.error("Name server results save Failed. ", error);
        }
    });
    getAndParseDNSList()
        .then(() => {
            setTimeout(() => {
                console.log("Run Ended"); //todo remove dev item
                // chunks = next.chunk(10000);
                count = 0;
                batchCount = 0;
                runner.emit("start");
                // let chunks = next.chunk(10);
                // chunks.forEach(function(_chunk){
                //     // runner.setNameservers();
                //     runner.runner(_chunk);
                // });
                // runner.run();
            }, waitBetweenRuns)
        })
        .catch(err => {
            logger.error("Updating NameServer list failed", err);
            logger.error("Proceeding with existing nameserver list");
            logger.error("Restarting Run.");
            setTimeout(() => {
                runner.emit("start", backupNameServerList);
                // runner.runner();
            }, waitBetweenRuns)
        })
}
