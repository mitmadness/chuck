import * as dotenvx from 'dotenv-extended';
import * as path from 'path';

export type EnvType = 'development'|'production';

export interface IChuckConfig {
    env: EnvType;
    logLevel: string;
    serverPort: number;
    mongoUrl: string;
    redis: { host: string; port: number; db: number };
    toureiro: { enable: boolean, user: string; password: string; };
    unityPath: string|undefined;
    azure: { enableEmu: boolean; };
}

//=> Load default environment variables with dotenv-extended
dotenvx.load({
    defaults: path.resolve(`${__dirname}/../.env.defaults`)
});

//=> Hydrate config with the environment variables
const config: IChuckConfig = {
    env: process.env.NODE_ENV || process.env.CHUCK_ENV,
    logLevel: process.env.CHUCK_LOGLEVEL,
    serverPort: parseInt(process.env.CHUCK_SERVERPORT, 10),
    mongoUrl: process.env.CHUCK_MONGOURL,
    redis: {
        host: process.env.CHUCK_REDIS_HOST,
        port: parseInt(process.env.CHUCK_REDIS_PORT, 10),
        db: parseInt(process.env.CHUCK_REDIS_DB, 10)
    },
    toureiro: {
        enable: process.env.CHUCK_TOUREIRO_ENABLE === 'true',
        user: process.env.CHUCK_TOUREIRO_USER,
        password: process.env.CHUCK_TOUREIRO_PASSWORD
    },
    unityPath: process.env.CHUCK_UNITY_EDITOR_PATH,
    azure: {
        enableEmu: process.env.CHUCK_ENABLEAZUREEMULATOR === 'true'
    }
};

export default config;
