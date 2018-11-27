const request = require('request-promise-native');

export default function fileCheck(files) {
  let count = 1;
  return new Promise((resolve, reject) => {
    try {
      for (let i = 0; i < files.length; i++) {
        getAndCompare(files[i], (result) => {
          count++;
          if (!result) {
            resolve(false);
          }
          if (count == files.length) {
            resolve(true);
          }
        });
      }
    } catch (e) {
      reject(e);
    }
  });

}

async function getAndCompare(file, callback) {
  let github = 'https://raw.githubusercontent.com/kvhnuke/etherwallet/gh-pages';
  let site = 'https://www.myetherwallet.com';
  let time_stamp = Date.now();
  let githubResult = await request(github + file + '?' + time_stamp)
  try {
    let siteResult = await request(site + file + '?' + time_stamp)
    if (githubResult === siteResult) return callback(true)
    return callback(false)
  } catch(e) {
    return callback(false)    
  }
}
