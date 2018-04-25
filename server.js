require("dotenv").config();
const fs = require("fs");
const path = require("path");
const events = require("events");
const express = require("express");
const https = require("https");
const clone = require("clone");
const request = require("request-promise-native");

const Runner = require("./runner");
const nameservers = require("./ns_all");
const amzn = require("./amazon_r53");
const countryListing = require("./country_List");
const logger = require("./logger");

const runOptions = {
    batchSize: 5000,
waitBetweenRuns: 10000 //100000
};
// const runner = new Runner(nameservers, amzn, runOptions);
const app = express();
const emitter = new events.EventEmitter();

const DNS_LIST_URL = process.env.DNS_LIST_URL || "https://public-dns.info/nameservers.csv";
// runner.setEmitter(emitter);

// //todo remove dev item
// const v8 = require('v8');
// v8.setFlagsFromString('--trace_gc --print_cumulative_gc_stat');
// setTimeout(function() { v8.setFlagsFromString('--notrace_gc'); }, 60e3);

const options = {
    key: fs.readFileSync(path.join(__dirname, process.env.HTTPS_KEY_FILE)),
    cert: fs.readFileSync(path.join(__dirname, process.env.HTTPS_CERT_FILE)),
    rejectUnauthorized: process.env.STATUS === "production"
};

const server = https.createServer(options, app);

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server Listening on Port ${port}`);
    request(DNS_LIST_URL)
        .then(function(result){
            let locations = [];
            let split = result.split("\n");
            logger.info("Updating NameServer list. Restarting Run.");
            for (let i = 1; i < split.length; i++) {
                try {
                    let row = split[i].replace("\r", "").split(",");
                    if(row.length >= 8) locations.push([row[0], row[2], row[1]]);

                } catch (e) {
                    logger.error(e);
                }
            }
            // runner.setNameservers(locations);
            split = [];
            emitter.emit("startRun", locations);
            // return locations;
        })
        // .then(_nameservers => {
        //     logger.info("Initial Run Start");
        //     emitter.emit("startRun", _nameservers);
        //     // runner.run(_nameservers);
        //     // setTimeout(() => {
        //     // logger.info("Initial Run Start");
        //     // runner.run();
        //     // }, 30000)
        // })
        .catch(err => {
            logger.error(err);
        })

});


emitter.on("startRun", function(_nameServers){
    let runner = new Runner(nameservers, amzn, runOptions);
    runner.setEmitter(emitter);
    runner.run(_nameServers);
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
                        if(err) throw err;
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
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    if(!/favicon/.test(req.originalUrl)) logger.warn(`INVALID ROUTING ATTEMPT: {hostname: ${req.hostname}, ip: ${req.ip}, originalUrl: ${req.originalUrl}, error: ${err}}`);
    res.status(err.status || 500);
});


emitter.on("end", (results) => {
    //todo uncomment after dev
    logger.info("Run Complete.");
    fs.writeFileSync(path.join(__dirname, process.env.DNS_RESULT_FILE), JSON.stringify(results), (error) => {
        if (error) {
            logger.error("Name server results save Failed. ", error);
        }
    });
    request(DNS_LIST_URL)
        .then(function(result){
            let locations = [];
            let split = result.split("\n");
            logger.info("Updating NameServer list. Restarting Run.");
            for (let i = 1; i < split.length; i++) {
                try {
                    let row = split[i].replace("\r", "").split(",");
                    if(row.length >= 8) locations.push([row[0], row[2], row[1]]);

                } catch (e) {
                    logger.error(e);
                }
            }
            // runner.setNameservers(locations);
            split = [];
            return locations;
        })
        .then(_nameServers => {
            setTimeout(() => {
                let runner = new Runner(nameservers, amzn, runOptions);
                runner.setEmitter(emitter);
                runner.run(_nameServers);
            }, 100000)
        })
        .catch(err => {
            logger.error("Updating NameServer list failed", err);
            logger.error("Proceeding with existing nameserver list");
            logger.error("Restarting Run.");
            setTimeout(() => {
                let runner = new Runner(nameservers, amzn, runOptions);
                runner.setEmitter(emitter);
                runner.run();
            }, 100000)
        })
});



function getAndParseDNSList(){
   return request(DNS_LIST_URL)
        .then(function(result){
            let locations = [];
            let split = result.split("\n");
            logger.info("Updating NameServer list. Restarting Run.");
            for (let i = 1; i < split.length; i++) {
                try {
                    let row = split[i].replace("\r", "").split(",");
                    if(row.length >= 8) locations.push([row[0], row[2], row[1]]);

                } catch (e) {
                    logger.error(e);
                }
            }
            // runner.setNameservers(locations);
            split = [];
            emitter.emit("startRun", locations);
            return locations;
        })
}