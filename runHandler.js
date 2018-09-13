require('dotenv').config();
const fs = require('fs');
const path = require('path');
const events = require('events');
const request = require('request-promise-native');

const Runner = require('./runner');
const nameservers = require('./ns_all.json');
const countryListing = require('./country_List.json');

const logger = require('./logger').verbose;
const serverErrorLogger = require('./logger').serverErrors;
const logInvalidDNS = require('./logger').invalidDNS;

const runner = new Runner(nameservers);
const emitter = new events.EventEmitter();

const DNS_LIST_URL = process.env.DNS_LIST_URL || 'https://public-dns.info/nameservers.csv';
runner.setEmitter(emitter);

let lastBad = {};
let resultBkup;

function saveToFile(name) {
  return path.join(__dirname, 'MewChecker', 'dist', name);
}

console.log('Child Process Started'); //todo remove dev item
process.send('child');

process.on('message', (msg) => {
  console.log('MESSAGE'); //todo remove dev item
  if (msg == 'terminate') {
    process.exit();
  }
});

getAndParseDNSList()
  .then(_nameServers => {
    logger.info('Initial Run Start');
    console.log('Initial Run Start'); //todo remove dev item
    runner.setNameservers(_nameServers);
    runner.run();
  })
  .catch(err => {
    serverErrorLogger.error(err);
  });

emitter.on('end', (results) => {
  //todo uncomment after dev
  logger.info('Run Complete.');
  let newtimeStamp = new Date().toUTCString();
  results.timestamp = newtimeStamp;
  fs.writeFile(saveToFile(process.env.DNS_RESULT_FILE), JSON.stringify(results), (error) => {
    if (error) {
      logger.error('Name server results save Failed. ', error);
      process.send('runComplete');
    } else {
      let timestamp = {timestamp: newtimeStamp};
      fs.writeFile(saveToFile(process.env.DNS_TIMECHECK_FILE), JSON.stringify(timestamp), (error) => {
        try {
          processBadResults(results)
            .then(() => {
              if (error) {
                logger.error('time check file save Failed. ', error);
                process.send('runComplete');
              } else {
                resultBkup = null;
                process.send('runComplete');
              }
            })
            .catch(_error => {
              logger.error('Send bad results Failed. ', _error);
              process.send('runComplete');
            });
        } catch (e) {
          resultBkup = null;
          process.send('runComplete');
        }
      });
      // resultBkup = null;
      // process.send("runComplete")
    }
  });
});

emitter.on('error', (_error) => {
  serverErrorLogger.error(_error);
});

emitter.on('invalidDNS', (_error) => {
  logInvalidDNS.error(_error);
});

function processBadResults(results) {
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(saveToFile('lastBad.json'), (error, data) => {
        if (!error) lastBad = JSON.parse(data);


        if(!lastBad.lastReset) lastBad = {lastReset: Date.now()};
        if (lastBad.lastReset >= Date.now() + 86400000) {
          lastBad = {lastReset: Date.now()};
        }

        const newResults = [];
        results.bad.forEach(item => {
          if (!lastBad[item.ns]) {
            const entry = `IP: ${item.ns}\nName: ${item.name}\nCountry: ${item.countryShort}\n`;
            newResults.push(entry);
          }
          lastBad[item.ns] = item;
        });
        fs.writeFile(saveToFile('lastBad.json'), JSON.stringify(lastBad), (error) => {
          if (error) {
            logger.error('recent incorrect DNS record file save Failed. ', error);
          }
        });

        if (newResults.length > 0) {
          let resultMessage = newResults.join('\n');
          process.send('bad ' + resultMessage);
        }
      });

    } catch (e) {
      console.error(e); // todo replace with proper error
      reject(e);
    }
  });
}

function getAndParseDNSList() {
  return request(DNS_LIST_URL)
    .then(result => {
      let locations = [];
      let split = result.split('\n');
      logger.info('Updating NameServer list. Restarting Run.');
      for (let i = 1; i < split.length; i++) {
        try {
          let row = split[i].replace('\r', '').split(',');
          if (row.length >= 8) locations.push([row[0], row[2], row[1]]);

        } catch (e) {
          serverErrorLogger.error(e);
        }
      }
      return locations;
    });
}
