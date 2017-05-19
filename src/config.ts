import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export type Env = 'development'|'production';

export interface IChuckConfig {
    env: Env;
    logLevel: string;
    serverPort: number;
    mongoUrl: string;
    redis: { host: string; port: number; db: number };
    toureiro: { enable: boolean, user: string; password: string; };
    unityPath: string|undefined;
    enableAzureEmulator: boolean;
}

//=> Read the project's .env file at root
let envSource: string;
try {
    const envSourcePath = path.resolve(`${__dirname}/../.env`);
    envSource = fs.readFileSync(envSourcePath).toString();
} catch (err) {
    envSource = '';
}

//=> Parse the .env file content
const env = dotenv.parse(envSource);

//=> Hydrate config with the .env file merged with default values
const config: IChuckConfig = {
    env: env.NODE_ENV || process.env.NODE_ENV || 'development',
    logLevel: env.LOG_LEVEL || 'verbose',
    serverPort: parseInt(env.SERVER_PORT, 10) || 3001,
    mongoUrl: env.MONGO_URL || 'mongodb://localhost/chuck',
    redis: {
        host: env.REDIS_HOST || 'localhost',
        port: parseInt(env.REDIS_PORT, 10) || 6379,
        db: parseInt(env.REDIS_DB, 10) || 0
    },
    toureiro: {
        enable: env.TOUREIRO_ENABLE === 'true' || false,
        user: env.TOUREIRO_USER || 'admin',
        password: env.TOUREIRO_PASSWORD || 'admin'
    },
    unityPath: env.UNITY_EDITOR_PATH,
    enableAzureEmulator: env.ENABLE_AZURE_EMULATOR === 'true' || false
};

export default config;
