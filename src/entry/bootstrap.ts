import * as sourceMapSupport from 'source-map-support';
import '../config';
import logger from '../logger';

sourceMapSupport.install();

process.on('unhandledRejection', (reason: any): void => {
    logger.error('UNHANDLED REJECTION', reason);
    process.exit(1);
});

process.on('uncaughtException', (err: any): void => {
    logger.error('UNCAUGHT EXCEPTION', err);
    process.exit(1);
});
