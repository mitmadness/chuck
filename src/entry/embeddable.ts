import defaultConfig, { Env, IChuckConfig } from '../config';

export { IConversionJob } from '../converter/job';
export { IStepModule, IStepDescription, IStepsContext } from '../converter/steps/step';
export { IDownloadAssetsStepsContext } from '../converter/steps/01_download_assets';

export default function chuck(rawConfig?: Partial<IChuckConfig>): FluentChuckMaker {
    return new FluentChuckMaker(rawConfig);
}

export class FluentChuckMaker {
    private readonly config: Partial<IChuckConfig>;

    public constructor(rawConfig: Partial<IChuckConfig> = {}) {
        this.config = rawConfig;
    }

    public inEnv(env: Env): this {
        this.config.env = env;

        return this;
    }

    public onPort(port: number): this {
        this.config.serverPort = port;

        return this;
    }

    public connectMongo(connectionString: string): this {
        this.config.mongoUrl = connectionString;

        return this;
    }

    public connectRedis(host: string, port: number, db: number): this {
        this.config.redis = { host, port, db };

        return this;
    }

    public enableToureiro(user: string, password: string): this {
        this.config.toureiro = { enable: true, user, password };

        return this;
    }

    public boot(): void {
        Object.assign(defaultConfig, this.config);

        //=> Launch Chuck by its main entry point
        require('./standalone');
    }
}
