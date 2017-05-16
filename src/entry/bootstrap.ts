import * as sourceMapSupport from 'source-map-support';
import '../config';
import logger from '../logger';

sourceMapSupport.install();

process.on('unhandledRejection', (reason: any, promise: Promise<any>): void => {
    logger.error('UNHANDLED REJECTION', reason, promise);
    process.exit(1);
});
