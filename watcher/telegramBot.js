require('dotenv').config();
const request = require('request-promise-native');
const createLogger = require('logging').default;

// Error logger
const logger = createLogger('dns-checker:telegram-bot');

function sendUpdate(toSend) {
  if (typeof toSend === 'string') {
    if(process.env.TELEGRAM_BOT !== 'the_access_key_for_your_bot'){
      logger.error('No Telegram Bot credentials provided in .env file');
      return;
    }
    var options = {
      method: 'POST',
      url: `https://api.telegram.org/${process.env.TELEGRAM_BOT}/sendMessage`,
      headers:
        {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      form: {
        chat_id: '-290489995',
        text: toSend
      }
    };
    request(options)
      .catch(error => {
        logger.error(error);
      });
  }
}

module.exports = sendUpdate;
