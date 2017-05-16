import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export interface IChuckConfig {
    env: string;
    serverPort: number;
    mongoUrl: string;
    redis: { host: string; port: number; };
    toureiro: { user: string; password: string; };
}

let envSource: string;
try {
    const envSourcePath = path.resolve(`${__dirname}/../.env`);
    envSource = fs.readFileSync(envSourcePath).toString();
} catch (err) {
    envSource = '';
}

const env = dotenv.parse(envSource);

const config: IChuckConfig = {
    env: env.NODE_ENV || process.env.NODE_ENV || 'development',
    serverPort: parseInt(env.SERVER_PORT, 10) || 3001,
    mongoUrl: env.MONGO_URL || 'mongodb://localhost/chuck',
    redis: {
        host: env.REDIS_HOST || 'localhost',
        port: parseInt(env.REDIS_PORT, 10) || 6379
    },
    toureiro: {
        user: env.TOUREIRO_USER || 'admin',
        password: env.TOUREIRO_PASSWORD || 'admin'
    }
};

export default config;
