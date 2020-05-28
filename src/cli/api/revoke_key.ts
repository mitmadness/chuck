import { CommandModule } from 'yargs';
import config from '../../config';
import logger from '../../logger';
import { connectDatabase, disconnectFromDatabase } from '../../mongoose';
import { ApiKey } from '../../models';

/**
 * The API key is used to authenticate conversion requests, so revoking it forbid a client to do further conversions
 */
const command: CommandModule = {
    command: 'api:revoke-key <key>',
    describe: 'Revoke an API key',
    handler
};

interface IArgs {
    key: string;
}

async function handler(args: IArgs): Promise<void> {
    await connectDatabase(config.mongoUrl);

    await ApiKey.remove({ key: args.key });

    logger.info(`The key ${args.key} has been deleted or was nonexistent.`);

    await disconnectFromDatabase();
}

export default command;
