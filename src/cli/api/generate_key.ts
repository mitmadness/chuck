import { CommandModule } from 'yargs';
import config from '../../config';
import logger from '../../logger';
import { connectDatabase, disconnectFromDatabase } from '../../mongoose';
import { ApiKey } from '../../models';

const command: CommandModule = {
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
};

interface IArgs {
    save: boolean;
}

async function handler(args: IArgs): Promise<void> {
    const key = new ApiKey();

    logger.info(`Generated key: ${key.key}`);

    if (args.save) {
        await connectDatabase(config.mongoUrl);
        await key.save();
        await disconnectFromDatabase();

        logger.info('Key saved to database!');
    }
}

export default command;
