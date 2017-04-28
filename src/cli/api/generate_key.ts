import { CommandModule } from 'yargs';
import logger from '../../logger';
import { connectDatabase, disconnectFromDatabase } from '../../mongoose';
import { ApiKey } from '../../models';

interface IArgs {
    save: boolean;
}

async function handler(args: IArgs): Promise<void> {
    const key = new ApiKey();

    logger.info(`Generated key: ${key.key}`);

    if (args.save) {
        await connectDatabase(process.env.MONGO_URL);
        await key.save();
        await disconnectFromDatabase();

        logger.info('Key saved to database!');
    }
}

export default {
    command: 'api:generate-key',
    describe: 'Generate an API key',
    builder: {
        save: {
            alias: 'S',
            type: 'boolean',
            desc: 'Save the API key to the database for direct use',
            default: false
        }
    },
    handler
} as CommandModule;
