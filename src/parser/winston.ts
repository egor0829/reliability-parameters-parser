import winston from 'winston';
import {LoggingWinston} from '@google-cloud/logging-winston';
import {getCurrDateStr} from 'src/utils/date';

const loggingWinston = new LoggingWinston();

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.colorize(), winston.format.json(), winston.format.prettyPrint()),
    defaultMeta: {service: 'reliability-parameters'},
    transports: [
        new winston.transports.File({filename: `logs/errors.${getCurrDateStr()}.json`, level: 'error'}),
        new winston.transports.File({filename: `logs/logs.${getCurrDateStr()}.json`, level: 'logs'})
        // Add Stackdriver Logging
        // loggingWinston
    ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple()
        })
    );
}

export default logger;
