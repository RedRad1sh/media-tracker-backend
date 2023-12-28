const winston = require('winston');
const {
  combine,
  timestamp,
  prettyPrint,
  printf,
  errors
} = winston.format;
/**
 * @param {Object} config Logger configuration
 */
module.exports = log => {
  const logger = winston.createLogger({
    level: 'debug',
    format: combine(
      errors({
        stack: true
      }),
      timestamp(),
      prettyPrint(),
      printf(
        info => ` ${info.timestamp}  [${info.level}] : ${info.message} ${info.stack != null ? "\n\n\t StackTrace: \n\n" + info.stack : ""}`
      )
    ),
    transports: [
      new winston.transports.Console()
    ]
  });
  return logger
};
