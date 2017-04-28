import { CommandModule } from 'yargs';
import logger from '../../logger';
import { connectDatabase, disconnectFromDatabase } from '../../mongoose';
import { ApiKey } from '../../models';

interface IArgs {
    key: string;
}

async function handler(args: IArgs): Promise<void> {
    await connectDatabase(process.env.MONGO_URL);

    await ApiKey.remove({ key: args.key });

    logger.info(`The key ${args.key} has been deleted or was nonexistent.`);

    await disconnectFromDatabase();
}

export default {
    command: 'api:revoke-key <key>',
    describe: 'Revoke an API key',
    handler
} as CommandModule;
