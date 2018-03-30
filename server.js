require("dotenv").config();
const fs = require("fs");
const path = require("path");
const events = require("events");
const express = require("express");
const https = require("https");
const clone = require("clone");
const Runner = require("./runner");
const nameservers = require("./ns_all.json");
const request = require("request-promise-native");

const runner = new Runner(nameservers);
const app = express();
const emitter = new events.EventEmitter();
runner.setEmitter(emitter);

let resultBkup;

const options = {
    key: fs.readFileSync(path.join(__dirname, "devCerts/devCert.key")),
    cert: fs.readFileSync(path.join(__dirname, "devCerts/devCert.cert")),
    rejectUnauthorized: process.env.STATUS === "production"
};

const server = https.createServer(options, app);

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server Listening on Port ${port}`);
    runner.run();
});


app.use("/js", express.static(path.join(__dirname, "MewChecker/dist/js")));
app.use("/css", express.static(path.join(__dirname, "MewChecker/dist/css")));
app.use("/img", express.static(path.join(__dirname, "MewChecker/dist/img")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "MewChecker/dist/index.html"));
});


app.get("/dns-report", (req, res) =>{
    let filepath = path.join(__dirname, "validityList.json");
    try {
        fs.access(filepath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
            if(err) {
                res.send("{\"timestamp\": \"" + new Date().toUTCString() + "\",\"good\":[\"building initial list\"], \"bad\":[\"building initial list\"]}");
            } else {
                res.sendFile(filepath);
            }
        });
    } catch (e) {
        console.error(e);
    }
});

emitter.on("end", (results) => {
    console.info("Run Complete.");
    fs.writeFileSync(path.join(__dirname, "validityList.json"), JSON.stringify(results), (error) =>{
        if(error){
            console.info("Name server results save Failed");
            console.error(error);
            resultBkup = clone(results);
        } else {
            // console.info("Name server results saved");
            resultBkup = null;
        }
    });
    request("https://public-dns.info/nameservers.txt")
        .then((nameServerList) =>{
            let split = nameServerList.split("\n");
            console.info("Updating NameServer list. Restarting Run.");
            runner.setNameservers(split);
            // console.info("Restarting Run.");
            runner.run()
        })
        .catch(err =>{
            console.info("Updating NameServer list failed");
            console.error(err);
            console.info("Proceeding with existing nameserver list");
            console.info("Restarting Run.");
            runner.run()
        });
});

