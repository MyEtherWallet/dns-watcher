const request = require("request-promise-native");



export default function fileCheck(files){
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
    let github = "https://raw.githubusercontent.com/kvhnuke/etherwallet/mercury/dist";
    let site = "https://www.myetherwallet.com";
    // return new Promise(((resolve, reject) => {
    request(github + file)
        .then((result) => {
            request(site + file)
                .then((_result) =>{
                    if(result === _result){
                        console.log("getAndCompare all good");
                        callback(true)
                    } else {
                        console.log("getAndCompare all not good");
                        callback(false);
                    }
                })
        });
}
