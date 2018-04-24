

const logger = {
    error: console.error,
    warn: console.info,
    info: console.log
};

module.exports = logger;
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