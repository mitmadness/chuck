import * as dotenvx from 'dotenv-extended';
import * as path from 'path';

export type EnvType = 'development'|'production';

export interface IChuckConfig {
    /**
     * The release number of chuck, as specified in the package.json.
     * This will only have a real value in the npm distribution of chuck -- value is otherwise "0.0.0-development".
     */
    release: string;

    /**
     * aka NODE_ENV. Configures the mode (`development` or `production`) in which the server is running.
     *  - development: permissive CORS rules are set on the API
     *  - production: timestamps in log messages and more verbose HTTP logs
     *
     * @default process.env.NODE_ENV || 'development'
     */
    env: EnvType;

    /**
     * Minimum log level (npm standard log levels are used).
     *
     * @see https://github.com/winstonjs/winston#logging-levels
     * @default 'verbose'
     */
    logLevel: string;

    /**
     * Chuck HTTP server port.
     *
     * @default 3001
     */
    serverPort: number;

    /**
     * Connection string to a MongoDB database.
     *
     * @default 'mongodb://localhost/chuck'
     */
    mongoUrl: string;

    /**
     * DSN for Sentry error reporting.
     */
    ravenDsn: string;

    /**
     * Redis connection informations.
     *
     * @default { host: 'localhost', port: 6379, db: 0 }
     */
    redis: { host: string; port: number; db: number };

    /**
     * Admin Web UIs configuration. Used by the admin interface and Toureiro.
     *
     * @default { enable: false, user: 'admin', password: 'admin' }
     */
    adminWebUis: { enable: boolean, user: string; password: string; };

    /**
     * Unity Editor path (if not installed in the standard path).
     *
     * @see https://github.com/mitmadness/AssetBundleCompiler#changing-unitys-executable-path
     * @default undefined (auto)
     */
    unityPath: string|undefined;

    /**
     * Azure configuration.
     *
     * @default { enableEmu: false }
     */
    azure: { enableEmu: boolean; };

    /**
     * An array of module names.
     * Those modules will be loaded dynamically as step plugins.
     */
    stepModulePlugins: string[];
}

//=> Load default environment variables with dotenv-extended
dotenvx.load({
    defaults: path.resolve(`${__dirname}/../.env.defaults`)
});

//=> Determine release number
// tslint:disable-next-line:no-var-requires
const release = require('../package.json').version;

//=> Hydrate config with the environment variables
const config: IChuckConfig = {
    release,
    env: process.env.NODE_ENV || process.env.CHUCK_ENV,
    logLevel: process.env.CHUCK_LOGLEVEL,
    serverPort: parseInt(process.env.CHUCK_SERVERPORT, 10),
    mongoUrl: process.env.CHUCK_MONGOURL,
    ravenDsn: process.env.CHUCK_RAVENDSN,
    redis: {
        host: process.env.CHUCK_REDIS_HOST,
        port: parseInt(process.env.CHUCK_REDIS_PORT, 10),
        db: parseInt(process.env.CHUCK_REDIS_DB, 10)
    },
    adminWebUis: {
        enable: process.env.CHUCK_ADMINWEBUIS_ENABLE === 'true',
        user: process.env.CHUCK_ADMINWEBUIS_USER,
        password: process.env.CHUCK_ADMINWEBUIS_PASSWORD
    },
    unityPath: process.env.CHUCK_UNITYPATH,
    azure: {
        enableEmu: process.env.CHUCK_AZURE_ENABLEEMU === 'true'
    },
    stepModulePlugins: process.env.CHUCK_STEPMODULEPLUGINS ? process.env.CHUCK_STEPMODULEPLUGINS.split(',') : []
};

export default config;
