require('dotenv').config();
const fs = require('fs');
const events = require('events');
const debug = require('debug');
const createLogger = require('logging').default;

const Runner = require('./runner');
const {saveToFile, processBadResults, getAndParseDNSList, processResults} = require('./helpers');

// Runner arguments
const nameservers = require('../ns_all.json');
const allowedResolutions = require('../allowedResolutions.json');

// Debug loggers
const logger = debug('dns-checker:run-handler');
const logInvalidDNS = debug('dns-checker:invalidDNS');
// Error logger
const serverErrorLogger = createLogger('dns-checker:runHandlerError');

const runner = new Runner(nameservers, allowedResolutions);
const emitter = new events.EventEmitter();
runner.setEmitter(emitter);

logger('runHandler process started');
process.send('child');

process.on('message', (msg) => {
  if (msg == 'terminate') {
    logger('terminate message received')
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
    serverErrorLogger.error(err);
  });

emitter.on('end', (results) => {
  logger('Run Complete - end emitted.');
  try {
    processResults(results)
      .then(()=>{
        process.send('runComplete');
      })
      .catch((error) =>{
        serverErrorLogger.error(error);
        process.send('runComplete');
      })
  } catch (e) {
    resultBkup = null;
    serverErrorLogger.error('Error on end');
    logger('Catch block executed');
    process.send('runComplete');
  }
  finally {
    logger('Finally block executed');
    // terminates process if it fails to get killed before timeout is up after end is received
    const timeOut = process.env.RUN_TIMEOUT || 480000;
    const timeoutInMin = (timeOut / 1000) / 60;
    const stallTerminate = setTimeout(() => {
      serverErrorLogger.error(`Run still going after ${timeoutInMin} minutes: ${new Date(Date.now()).toString()}`);
      process.send('runComplete');
    }, timeOut);
    stallTerminate.unref()
  }
});

emitter.on('error', (_error) => {
  serverErrorLogger.error(_error);
});

emitter.on('invalidDNS', (_error) => {
  logInvalidDNS('\n');
  logInvalidDNS(_error);
});

emitter.on('terminate', () => {
  serverErrorLogger.error('Exited due to error. Terminating Run.');
  process.send('runComplete');
});



