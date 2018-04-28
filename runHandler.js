require("dotenv").config();
const fs = require("fs");
const path = require("path");
const events = require("events");
const request = require("request-promise-native");

const Runner = require("./runner");
const nameservers = require("./ns_all.json");
const countryListing = require("./country_List.json");

const logger = require("./logger").verbose;
const serverErrorLogger = require("./logger").serverErrors;
const logInvalidDNS = require("./logger").invalidDNS;

const runner = new Runner(nameservers);
const emitter = new events.EventEmitter();

const DNS_LIST_URL = process.env.DNS_LIST_URL || "https://public-dns.info/nameservers.csv";
runner.setEmitter(emitter);

let resultBkup;


console.log("Child Process Started"); //todo remove dev item
process.send("child");

process.on("message", (msg) =>{
    console.log("MESSAGE"); //todo remove dev item
    if(msg == "terminate"){
        process.exit();
    }
});

getAndParseDNSList()
    .then(_nameServers => {
        logger.info("Initial Run Start");
        console.log("Initial Run Start"); //todo remove dev item
        runner.setNameservers(_nameServers);
        runner.run();
    })
    .catch(err => {
        serverErrorLogger.error(err);
    });



emitter.on("end", (results) => {
    //todo uncomment after dev
    logger.info("Run Complete.");
    fs.writeFile(path.join(__dirname, "MewChecker", "dist", process.env.DNS_RESULT_FILE), JSON.stringify(results), (error) => {
        if (error) {
            logger.error("Name server results save Failed. ", error);
            process.send("runComplete")
        } else {
            resultBkup = null;
            process.send("runComplete")
        }
    });
});

emitter.on("error", (_error) =>{
    serverErrorLogger.error(_error);
});

emitter.on("invalidDNS", (_error) =>{
    logInvalidDNS.error(_error);
});


function getAndParseDNSList(){
    return request(DNS_LIST_URL)
        .then(result => {
            let locations = [];
            let split = result.split("\n");
            logger.info("Updating NameServer list. Restarting Run.");
            for (let i = 1; i < split.length; i++) {
                try {
                    let row = split[i].replace("\r", "").split(",");
                    if(row.length >= 8) locations.push([row[0], row[2], row[1]]);

                } catch (e) {
                    serverErrorLogger.error(e);
                }
            }
            return locations;
        })
}