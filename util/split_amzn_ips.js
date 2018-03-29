const util = require('util');
const dns = require('dns');
const fs = require("fs");
const ns = require("./amazon_ip-ranges.json");

let aws = {};

for (let i = 0; i < ns.prefixes.length; i++) {
    let ip = ns.prefixes[i].ip_prefix;
    let initialSplit = ip.split("\\");
    let ipSplit = initialSplit[0].split(".");
    if(aws[ipSplit[0]]){
        aws[ipSplit[0]].push(ip);
    } else {
        aws[ipSplit[0]] = [ip]
    }
    // let addr = ['"' + ipSplit[0] + '"'  , '"' + ipSplit[1] +'"' ];
    // fs.appendFile('amazonPreFixes.txt', addr  + ',\n', (err) => {
    //     if (err) throw err;
    //     // console.log('The "data to append" was appended to file!');
    // });
}

fs.appendFile('amazonPreFixes.json', JSON.stringify(aws)  + ',\n', (err) => {
    if (err) throw err;
    // console.log('The "data to append" was appended to file!');
});

function splitCheck(){

}