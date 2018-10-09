require('dotenv').config();
const fs = require('fs');
const Pageres = require('pageres');
const createLogger = require('logging').default;
const debug = require('debug');
const {saveToFile} = require('./helpers');

// Debug logger
const screenShotLogger = debug('dns-checker:screenShot-runner');
// Error logger
const screenShotError = createLogger('dns-checker:screenShotError');

function screenShotPreProcess(resultFileName = process.env.DNS_RESULT_FILE) {
  try {

    fs.readFile(saveToFile(resultFileName), 'utf8', async (error, data) => {
      if (error) {
        screenShotError.error(error);
      }
      const results = JSON.parse(data);
      screenShotLogger(results.bad);

      const badResults = [...results.bad];
      screenShotCreate(badResults.pop())
        .then(() => {
          if (badResults.length > 0) {
            screenShotCreate(badResults.pop());
          } else {
            process.send('runComplete');
          }
        })
        .catch(error => {
          screenShotError.error(error);
          if (badResults.length > 0) {
            screenShotCreate(badResults.pop());
          } else {
            process.send('runComplete');
          }
        });
    });

  } catch (e) {
    screenShotError.error(e);
    reject(e);
  }
}

function screenShotCreate(resolved) {
  screenShotLogger(`start createScreenShot: ${new Date().toUTCString()}`);
  return new Promise((resolve, reject) => {
    try {
      let makeImage = (ip) => {
        new Pageres({
          delay: 2,
          timeout: 20,
          filename: '<%= url %>-<%= size %>',
          headers: {origin: 'www.myetherwallet.com'}
        })
          .src(`https://${ip}`, ['480x320'])
          .dest(saveToFile(process.env.BAD_RESOLUTIONS))
          .run()
          .then(() => {
            screenShotLogger(`Screen shot created for ip: ${ip}`);
            if (resolved.resolved.length > 0) {
              makeImage(resolved.resolved.pop());
            } else {
              resolve();
            }
          })
          .catch(error => {
            screenShotLogger(`Screen shot failed for ip: ${ip}`);
            screenShotError.error(error);
            fs.copyFile(saveToFile('ScreenShotFailed-Placeholder.png'), saveToFile(process.env.BAD_RESOLUTIONS + `/${ip}-480x320.png`), (err) => {
              if (err) screenShotError.error(err);
            });
            if (resolved.resolved.length > 0) {
              makeImage(resolved.resolved.pop());
            } else {
              resolve();
            }
          });
      };

      makeImage(resolved.resolved.pop());
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = screenShotPreProcess;

screenShotPreProcess();
