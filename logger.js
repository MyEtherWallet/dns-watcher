// const logger = {
//     error: console.error,
//     warn: console.info,
//     info: console.log
// };
const moment = require("moment");
const winston = require('winston');
var verboseTransport = new (require('winston-daily-rotate-file'))({
    name: 'verbose',
    filename: "%DATE%" + process.env.VERBOSE_LOG_FILE,
    datePattern: 'dd-MM-yyyy',
    dirname: process.env.LOG_DIR + process.env.VERBOSE_LOG_DIR,
    prepend: true,
    json: false,
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '2d',
    timestamp: function () {
        return moment().format('D/MM/YYYY HH:mm:ss:SSS');
    }
});
// var serverErrors = new(winston.Logger)({
//     transports: [
//         new(require('winston-daily-rotate-file'))({
// //=>
//             name: 'serverErrors',
// //<=
//             filename: process.env.LOG_DIR + process.env.ERROR_LOG_DIR + "%DATE%" + process.env.ERROR_LOG_FILE,
//             datePattern: 'dd-MM-yyyy',
//             prepend: true,
//             json: false,
//             zippedArchive: true,
//             maxSize: '20m',
//             maxFiles: '14d',
//             timestamp: function() {
//                 return moment().format('D/MM/YYYY HH:mm:ss:SSS');
//             }
//         }),
// //=>
//         verbose
// //<=
//     ]
// });

var invalidDnsTransport = new (require('winston-daily-rotate-file'))({
//=>
    name: 'invalidDNS',
//<=
    filename: process.env.INVALID_DNS_LOG_FILE,
    datePattern: 'dd-MM-yyyy',
    dirname: process.env.LOG_DIR + process.env.INVALID_DNS_LOG_DIR,
    prepend: true,
    json: false,
    zippedArchive: true,
    maxSize: '10m',
    maxFiles: '30d',
    timestamp: function () {
        return moment().format('D/MM/YYYY HH:mm:ss:SSS');
    }
})

var invalidDNS = new (winston.Logger)({
    transports: [
        invalidDnsTransport
    ]
});

var verbose = new (winston.Logger)({
    transports: [
        verboseTransport
    ]
});

module.exports = {
    invalidDNS,
    verbose
};


// const availableLoggers = [verbose, serverErrors, invalidDNS];
// let transports = [];
//
// function buildTransportsArray(){
//     let transports = [];
//     if()
// }

// const logger = winston.Logger({
//     transports: [
//     ]
// });



//
//
// var debug = new winston.Logger({
//     levels: {
//         debug: 0
//     },
//     transports: [
//         new (winston.transports.File)({ filename: configs.PATH_TO_LOG, level: 'debug'}),
//         new (winston.transports.Console)({level: 'debug'})
//     ]
// });
//
// var info = new winston.Logger({
//     levels: {
//         info: 1
//     },
//     transports: [
//         new (winston.transports.File)({ filename: configs.PATH_TO_LOG, level: 'info'}),
//         new (winston.transports.Console)({level: 'info'})
//     ]
// });
//
// var warn = new winston.Logger({
//     levels: {
//         warn: 2
//     },
//     transports: [
//         new (winston.transports.File)({ filename: configs.PATH_TO_LOG, level: 'warn'}),
//         new (winston.transports.Console)({level: 'warn'})
//     ]
// });
//
// var error = new winston.Logger({
//     levels: {
//         error: 3
//     },
//     transports: [
//         new (winston.transports.File)({ filename: configs.PATH_TO_LOG, level: 'error'}),
//         new (winston.transports.Console)({level: 'error'})
//     ]
// });

// var exports = {
//     debug: function(msg){
//         debug.debug(msg);
//     },
//     info: function(msg){
//         info.info(msg);
//     },
//     warn: function(msg){
//         warn.warn(msg);
//     },
//     error: function(msg){
//         error.error(msg);
//     },
//     log: function(level,msg){
//         var lvl = exports[level];
//         lvl(msg);
//     }
// };
//
// module.exports = exports;


//========== ORIGINAL CODE =================
// const winston = require('winston');
// var logger = new winston.Logger({
//     transports: [
//         new winston.transports.File({
//             handleExceptions: true,
//             humanReadableUnhandledException: true,
//             level: process.env.LOG_LEVEL,
//             timestamp: true,
//             filename: process.env.LOG_FILE,
//             maxsize: 10000,
//             zippedArchive: true,
//             json: true
//         }),
//         new winston.transports.Console({
//             handleExceptions: true,
//             json: true,
//             level: "debug"
//         })
//     ],
//     exitOnError: false
// });
//
//
// module.exports = logger;