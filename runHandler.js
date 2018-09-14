require('dotenv').config();
const fs = require('fs');
const path = require('path');
const events = require('events');
const request = require('request-promise-native');

const Runner = require('./runner');
const nameservers = require('./ns_all.json');
const countryListing = require('./country_List.json');

const debug = require('debug');
const logger = debug('dns-checker:verbose');
const logInvalidDNS = debug('dns-checker:invalidDNS');
const serverErrorLogger = debug('dns-checker:runHandlerError');

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
    logger('Initial Run Start');
    runner.setNameservers(_nameServers);
    runner.run();
  })
  .catch(err => {
    serverErrorLogger(err);
  });

emitter.on('end', (results) => {
  //todo uncomment after dev
  logger('Run Complete.');
  try {
    let newtimeStamp = new Date().toUTCString();
    results.timestamp = newtimeStamp;
    fs.writeFile(saveToFile(process.env.DNS_RESULT_FILE), JSON.stringify(results), (error) => {
      if (error) {
        logger('Name server results save Failed. ', error);
        process.send('runComplete');
      } else {
        let timestamp = {timestamp: newtimeStamp};
        fs.writeFile(saveToFile(process.env.DNS_TIMECHECK_FILE), JSON.stringify(timestamp), (error) => {

          if (error) {
            logger('time check file save Failed. ', error);
            processBadResults(results)
              .then(() => {
                logger('Run Completing');
                process.send('runComplete');
              })
              .catch(_error => {
                logger('Send bad results Failed. ', _error);
                process.send('runComplete');
              });
            // process.send('runComplete');
          } else {
            resultBkup = null;
            processBadResults(results)
              .then(() => {
                logger('Run Completing');
                process.send('runComplete');
              })
              .catch(_error => {
                logger('Send bad results Failed. ', _error);
                process.send('runComplete');
              });
            // process.send('runComplete');
          }

        });
        // resultBkup = null;
        // process.send("runComplete")
      }
    });
  } catch (e) {
    resultBkup = null;
    serverErrorLogger('Error on end');
    process.send('runComplete');
  } finally {
    // terminates process if it fails to get killed before 30 seconds is up after end is received
    setTimeout(() => {
      process.send('runComplete');
    }, 30000);
  }
});

emitter.on('error', (_error) => {
  serverErrorLogger(_error);
});

emitter.on('invalidDNS', (_error) => {
  logInvalidDNS(_error);
});

emitter.on('terminate', () => {
  console.error('Exited due to error. Terminating Run.');
  process.send('runComplete');
});

function processBadResults(results) {
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(saveToFile('lastBad.json'), (error, data) => {
        if (!error) lastBad = JSON.parse(data);

        if (!lastBad.lastReset) lastBad = {lastReset: Date.now()};
        if (lastBad.lastReset + 86400000 >= Date.now()) {
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
            logger('recent incorrect DNS record file save Failed. ', error);
            process.send('runComplete');
          }
        });

        if (newResults.length > 0) {
          let resultMessage = newResults.join('\n');
          process.send('bad ' + resultMessage);
        }
      });

    } catch (e) {
      serverErrorLogger(e); // todo replace with proper error
      reject(e);
    }
  });
}

function getAndParseDNSList() {
  return request(DNS_LIST_URL)
    .then(result => {
      let locations = [];
      let split = result.split('\n');
      logger('Updating NameServer list. Restarting Run.');
      for (let i = 1; i < split.length; i++) {
        try {
          let row = split[i].replace('\r', '').split(',');
          if (row.length >= 8) locations.push([row[0], row[2], row[1]]);

        } catch (e) {
          serverErrorLogger(e);
        }
      }
      return locations;
    });
}
