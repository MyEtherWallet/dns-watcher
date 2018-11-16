const path = require('path');
const fs = require('fs');

module.exports = {
  devServer: {
    open: true,
    host: '0.0.0.0',
    port: 8080,
    https: false,
    hotOnly: false,
    proxy: null,
    before: app => {
      app.use('/dns-report', (req, res, next) => {
        console.log(req.url); //todo remove dev item

        let _filepath = path.join(__dirname, 'dist', 'status-list.json');
        try {
          fs.access(_filepath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
            if (err) {
              console.error(err);
              res.end('{"timestamp": "' + new Date().toUTCString() + '"}');
            } else {
              fs.readFile(_filepath, 'utf-8', (err, _result) => {
                try {
                  if (err) throw err;
                  res.end(_result);
                } catch (e) {
                  console.error(e);
                }
              });
            }
          });
        } catch (e) {
          console.error(e);
        }
      });
      app.use('/new-results', (req, res) => {
        console.log(req.url); //todo remove dev item

        let filepath = path.join(__dirname, 'dist', 'timeCheck.json');
        try {
          fs.access(filepath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
            if (err) {
              console.error(err);
              res.end('{"timestamp": "' + new Date().toUTCString() + '"}');
            } else {
              fs.readFile(filepath, 'utf-8', (err, _result) => {
                try {
                  if (err) throw err;
                  res.end(_result);
                } catch (e) {
                  console.error(e);
                }
              });
            }
          });
        } catch (e) {
          console.error(e);
        }
      });
      // app is an express instance
    }
  }
};
