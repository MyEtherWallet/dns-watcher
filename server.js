require('dotenv').config();

const cron = require('node-cron');
const cp = require('child_process');

const DNS_LIST_URL = process.env.DNS_LIST_URL || 'https://public-dns.info/nameservers.csv';

const debug = require('debug');
const serverErrorLogger = debug('dns-checker:server');
const sendTelegramMessage = require('./telegramBot');

/*
CRON Syntax Ref.:
 # ┌────────────── second (optional)
 # │ ┌──────────── minute
 # │ │ ┌────────── hour
 # │ │ │ ┌──────── day of month
 # │ │ │ │ ┌────── month
 # │ │ │ │ │ ┌──── day of week
 # │ │ │ │ │ │
 # │ │ │ │ │ │
 # * * * * * *

 Allowed values
    field	value
    second	0-59
    minute	0-59
    hour	0-23
    day of month	1-31
    month	1-12 (or names)
    day of week	0-7 (or names, 0 or 7 are sunday)
* */

let cronTime = '*/1 * * * *';
console.log('DNS server check set to run every 10 minutes');

var valid = cron.validate(cronTime);

if (!valid) process.exit(1);

let task = cron.schedule(cronTime, function() {
  console.log(`DNS server check started at ${new Date().toUTCString()}`);

  let doRun = cp.fork(`${__dirname}/runHandler.js`);

  doRun.on('message', (msg) => {
    if (msg == 'runComplete') {
      console.log('Run Comple');
      doRun.kill('SIGTERM');
      console.log('Child process terminated');
      // setTimeout(() => {
      //     doRun = cp.fork(`${__dirname}/runHandler.js`);
      // }, 100000)
    } else if (/^bad\s/.test(msg)) {
      sendTelegramMessage(msg.slice(4, msg.length));
    }
  });

  doRun.on('close', () => {
    console.log('child process closed'); //todo remove dev item
  });
  doRun.on('disconnect', () => {
    console.log('child process disconnect'); //todo remove dev item
  });
  doRun.on('error', (err) => {
    serverErrorLogger(err);
    console.log('child process error'); //todo remove dev item
  });
  doRun.on('exit', () => {
    console.log('child process exit'); //todo remove dev item
  });
}, true);

task.start();
