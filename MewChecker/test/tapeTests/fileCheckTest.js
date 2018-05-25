const test = require('tape')
const request = require("request-promise-native");

// const fileCheck = require('../../src/inBrowserFileCheck.js')


test("confirm FileChecker Operation", function(t){

  let files = [
    '/index.html',
    '/embedded.html',
    '/helpers.html',
    '/signmsg.html',
    '/bin/startMEW.js',
    '/css/etherwallet-master.min.css',
    // fontsBold: "",
    // fontsLight: "",
    // fontsRegular: "",
    '/js/etherwallet-master.js',
    '/js/etherwallet-static.min.js',
    '/js/jquery-1.12.3.min.js'
  ]

  fileCheck(files)
    .then(()=>{t.end()})

})


function fileCheck(files){
  let count = 1;
  return new Promise((resolve, reject) => {
    try {
      for (let i = 0; i < files.length; i++) {
        getAndCompare(files[i], (result) => {
          count++;
          if (!result) {
            resolve(false);
          }
          if(count == files.length) {
            resolve(true);
          }
        })
      }
    } catch (e) {
      reject(e);
    }
  })

}


function getAndCompare(file, callback) {
  let github = "https://raw.githubusercontent.com/kvhnuke/etherwallet/gh-pages";
  let site = "https://www.myetherwallet.com";
  let time_stamp = Date.now();
  request(github + file + "?t=" + time_stamp)
    .then((result) => {
      request(site + file  + "?t=" + time_stamp)
        .then((_result) =>{
          // console.log(_result); // todo remove dev item
          if(result === _result){
            console.log("getAndCompare all good");
            callback(true)
          } else {
            console.log("getAndCompare all not good");
            console.log(github + file); // todo remove dev item
            callback(false);
          }
        })
    });
}
