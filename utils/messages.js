const moment = require("moment");

function formatMessage(isBot, username, text) {
  return {
    isBot,
    username,
    text,
    time: moment().format("h:mm a"),
  };
}

module.exports = formatMessage;
