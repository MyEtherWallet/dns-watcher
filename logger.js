require("dotenv").config();
const moment = require("moment");
const winston = require('winston');

var serverErrorsTransport = new (require('winston-daily-rotate-file'))({
//=>
    name: 'serverErrors',
//<=
    filename: "errors.log",
    // datePattern: 'D-MM-YYYY',
    dirname: "./log/server",
    prepend: true,
    json: false,
    zippedArchive: true,
    maxSize: '10m',
    maxFiles: '2d',
    timestamp: function () {
        return moment().format('D/MM/YYYY HH:mm:ss:SSS');
    }
})

var invalidDnsTransport = new (require('winston-daily-rotate-file'))({
//=>
    name: 'invalidDNS',
//<=
    filename: "invalid_dns.log",
    // datePattern: 'D-MM-YYYY',
    dirname: "./log/dns",
    prepend: true,
    json: false,
    zippedArchive: true,
    maxSize: '10m',
    maxFiles: '2d',
    timestamp: function () {
        return moment().format('D/MM/YYYY HH:mm:ss:SSS');
    }
})

var invalidDNS = new (winston.Logger)({
    transports: [
        invalidDnsTransport
    ]
});

var serverErrors = new (winston.Logger)({
    transports: [
        serverErrorsTransport
    ]
});

let noop = {
    info: function () {
    },
    error: function () {
    },
    warn: function () {
    }
};

const logger = {
    error: console.error,
    warn: console.info,
    info: console.log
};

if (process.env.STATUS === "development") {

    var verboseTransport = new (require('winston-daily-rotate-file'))({
        name: 'verbose',
        filename: process.env.VERBOSE_LOG_FILE,
        // datePattern: 'D-MM-YYYY',
        dirname: process.env.LOG_DIR + process.env.VERBOSE_LOG_DIR,
        prepend: true,
        json: true,
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '2d',
        timestamp: function () {
            return moment().format('D/MM/YYYY HH:mm:ss:SSS');
        }
    });


    var verbose = new (winston.Logger)({
        transports: [
            verboseTransport
        ]
    });

    module.exports = {
        invalidDNS: logger,
        verbose: logger,
        serverErrors: logger
    };
} else {
    module.exports = {
        invalidDNS,
        verbose: noop,
        serverErrors
    };
}


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