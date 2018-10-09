require('dotenv').config();
const cron = require('node-cron');

const {checkDnsServers} = require('./watcher/cronTask');

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

let cronTime = '*/10 * * * *';
console.log('DNS server check set to run every 10 minutes');

var valid = cron.validate(cronTime);

if (!valid) process.exit(1);

let task = cron.schedule(cronTime, checkDnsServers, true);

task.start();
