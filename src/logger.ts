import * as winston from 'winston';
import { StreamOptions } from 'morgan';
import config from './config';

// Wo wants nice colorized colors? WE DO!
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: config.logLevel,
            json: false,
            colorize: true,
            timestamp: config.env == 'production'
        })
    ]
});

export default logger;

export const morganStreamWriter: StreamOptions = {
    write(message: string): void {
        logger.info(message.replace(/\n$/, ''));
    }
};
