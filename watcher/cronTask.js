require('dotenv').config();
const cp = require('child_process');
const createLogger = require('logging').default;
const debug = require('debug');

// Debug loggers
const checkerEvents = debug('dns-checker:process-event');
const screenShotEvents = debug('dns-checker:process-event');
const reportingEvents = debug('dns-checker:telegram-message');
// Error loggers
const checkErrorLogger = createLogger('dns-checker:cronTask-check');
const screenShotErrorLogger = createLogger('dns-checker:cronTask-screenShot');

const sendTelegramMessage = require('./telegramBot');

function checkDnsServers() {
  console.log(`\nDNS server check started at ${new Date().toUTCString()}`); // add run start log entry

  let doRun = cp.fork(`${__dirname}/runHandler.js`);

  doRun.on('message', (msg) => {
    if (msg == 'runComplete') {
      doRun.kill('SIGTERM');
      console.log(`\nDNS server check completed at ${new Date().toUTCString()}`); // add run end log entry
      takeScreenShots();
    } else if (/^bad\s/.test(msg)) {
      reportingEvents(msg.slice(4, msg.length));
      if (process.env.STATUS === 'production') sendTelegramMessage(msg.slice(4, msg.length));
    }
  });

  doRun.on('close', () => {
    checkerEvents('child process closed');
  });
  doRun.on('disconnect', () => {
    checkerEvents('child process disconnect');
  });
  doRun.on('error', (err) => {
    checkErrorLogger.error(err);
    checkerEvents('child process error');
  });
  doRun.on('exit', () => {
    checkerEvents('child process exit');
  });
}

function takeScreenShots() {
  console.log(`Screen shot process started at ${new Date().toUTCString()}`); // add run start log entry
  let makePics = cp.fork(`${__dirname}/screenShooter.js`);
  makePics.on('message', (msg) => {
    if (msg == 'runComplete') {
      makePics.kill('SIGTERM');
      console.log(`Screen shot process completed at ${new Date().toUTCString()}`); // add run end log entry
    }
  });

  makePics.on('close', () => {
    screenShotEvents('Screen shot process closed');
  });
  makePics.on('disconnect', () => {
    screenShotEvents('Screen shot process disconnect');
  });
  makePics.on('error', (err) => {
    screenShotErrorLogger.error(err);
    screenShotEvents('Screen shot process error');
  });
  makePics.on('exit', () => {
    screenShotEvents('Screen shot process exit');
  });
}

module.exports = {
  checkDnsServers,
  takeScreenShots
};
