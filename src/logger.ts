import * as winston from 'winston';
import { StreamOptions } from 'morgan';

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            json: false,
            colorize: true,
            timestamp: process.env.NODE_ENV == 'production'
        })
    ]
});

export default logger;

export const morganStreamWriter: StreamOptions = {
    write(message: string): void {
        logger.info(message.replace(/\n$/, ''));
    }
};
