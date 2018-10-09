require('dotenv').config();
const fs = require('fs');
const path = require('path');
const request = require('request-promise-native');
const createLogger = require('logging').default;

const debug = require('debug');
const logger = debug('dns-checker:verbose');
const logInvalidDNS = debug('dns-checker:helpers');
const badResultProcessor = debug('dns-checker:helpers-process-bad-results');
const serverErrorLogger = createLogger('dns-checker:helpers');
const retrieveResultsError = createLogger('dns-checker:retrieve-last-bad');

function saveToFile(name) {
  const parentDir = path.resolve(__dirname, '..');
  console.log(parentDir); // todo remove dev item
  return path.join(parentDir, 'MewChecker', 'dist', name);
}

// functions used in to facilitate runner opperation and result processing
function processBadResults(results) {
  let lastBad = {};
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(saveToFile('lastBad.json'), (error, data) => {
        if (error !== null) {
          retrieveResultsError.error(error);
          lastBad = {lastReset: Date.now()};
        } else {
          try {
            badResultProcessor('Prior invalid results retrieved');
            lastBad = JSON.parse(data);
            logger(lastBad);
          } catch (e) {
            badResultProcessor('Prior invalid results retrieved');
            retrieveResultsError.error(error);
            lastBad = {lastReset: Date.now()};
          }
        }

        if (!lastBad.lastReset) lastBad = {lastReset: Date.now()};
        if (lastBad.lastReset + 86400000 <= Date.now()) {
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
            serverErrorLogger.error('recent incorrect DNS record file save Failed. ', error);
            process.send('runComplete');
          }
        });

        if (newResults.length > 0) {
          let resultMessage = newResults.join('\n');
          badResultProcessor('Results: ', resultMessage);
          process.send('bad ' + resultMessage);
          resolve(results);
        } else {
          badResultProcessor('No new invalid results found');
          resolve(results);
        }

      });

    } catch (e) {
      serverErrorLogger.error(e);
      reject(e);
    }
  });
}

function processResults(results) {
  return new Promise((resolve, reject) => {
    let newtimeStamp = new Date().toUTCString();
    results.timestamp = new Date().toUTCString();
    fs.writeFile(saveToFile(process.env.DNS_RESULT_FILE), JSON.stringify(results), (error) => {
      if (error) {
        logger('Name server results save Failed. ', error);
        reject(error);
      } else {
        logger('Preparing to set new timestamp');
        let timestamp = {timestamp: newtimeStamp};
        fs.writeFile(saveToFile(process.env.DNS_TIMECHECK_FILE), JSON.stringify(timestamp), (error) => {

          if (error) {
            logger('time check file save Failed. ', error);
            logger('Preparing to process bad results');
            processBadResults(results)
              .then(() => {
                logger('Process bad results complete. Run Completing');
                resolve();
              })
              .catch(_error => {
                serverErrorLogger.error('Process bad results Failed. ', _error);
                reject(_error);
              });
          } else {
            resultBkup = null;
            logger('Preparing to process bad results');
            processBadResults(results)
              .then(() => {
                logger('Process bad results complete. Run Completing');
                resolve();
              })
              .catch(_error => {
                serverErrorLogger.error('Process bad results Failed. ', _error);
                reject(_error);
              });
          }
        });
      }
    });
  });
}

function getAndParseDNSList() {
  const DNS_LIST_URL = process.env.DNS_LIST_URL || 'https://public-dns.info/nameservers.csv';
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
          serverErrorLogger.error(e);
        }
      }
      return locations;
    });
}

module.exports = {
  saveToFile,
  processBadResults,
  getAndParseDNSList,
  processResults
};
