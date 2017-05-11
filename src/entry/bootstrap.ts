import dotenvx from 'dotenv-extended';
import logger from '../logger';

//=> Load environment variables from .env and .env.defaults
dotenvx.load();

process.on('unhandledRejection', (reason: any, promise: Promise<any>): void => {
    logger.error('UNHANDLED REJECTION', reason, promise);
    process.exit(1);
});
