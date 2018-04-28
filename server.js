require("dotenv").config();

const DNS_LIST_URL = process.env.DNS_LIST_URL || "https://public-dns.info/nameservers.csv";

const cp = require('child_process');
let doRun = cp.fork(`${__dirname}/runHandler.js`);
const serverErrorLogger = require("./logger").serverErrors;


doRun.on("message", (msg) => {
    console.log(msg); //todo remove dev item
    if(msg == "runComplete"){
        doRun.kill('SIGTERM');
        console.log("run complete. child process terminated");
        setTimeout(() => {
            doRun = cp.fork(`${__dirname}/runHandler.js`);
        }, 100000)
    }
});


doRun.on("close", () =>{
    console.log("child process closed"); //todo remove dev item
});
doRun.on("disconnect", () =>{
    console.log("child process disconnect"); //todo remove dev item
});
doRun.on("error", (err) =>{
    serverErrorLogger.error(err);
    console.log("child process error"); //todo remove dev item
});
doRun.on("exit", () =>{
    console.log("child process exit"); //todo remove dev item
});
