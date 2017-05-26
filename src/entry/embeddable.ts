import defaultConfig, { EnvType, IChuckConfig } from '../config';
import * as pluginSteps from '../converter/plugin_steps';
import { IStepModule } from '../converter/steps/step';

//=> Export core symbols for writing plugin steps
export { IConversion } from '../models/IConversion';
export { ProgressFn, IStepDescription, IStepsContext, IStepModule } from '../converter/steps/step';

//=> Export core steps' context for reuse in plugin steps
export { IDownloadAssetsStepsContext } from '../converter/steps/01_download_assets';
export { IExecAssetBundleCompilerStepContext } from '../converter/steps/02_exec_assetbundlecompiler';

/**
 * Main entry function for embedded version of chuck.
 * Returns a fluent class for configuring then booting chuck.
 *
 * @param rawConfig Chuck's configuration
 * @returns {FluentChuckMaker}
 */
export default function chuck(rawConfig?: Partial<IChuckConfig>): FluentChuckMaker {
    return new FluentChuckMaker(rawConfig);
}

/**
 * Fluent API to create a chuck instance.
 * Do NOT construct it directly with new FluentChuckMaker(). Use chuck() instead.
 */
export class FluentChuckMaker {
    private readonly config: Partial<IChuckConfig>;

    public constructor(rawConfig: Partial<IChuckConfig> = {}) {
        this.config = rawConfig;
    }

    public inEnv(env: EnvType): this {
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

    public enableAdminWebUis(user: string, password: string): this {
        this.config.adminWebUis = { enable: true, user, password };

        return this;
    }

    public addSteps(...steps: IStepModule[]): this {
        steps.forEach(pluginSteps.register);

        return this;
    }

    /**
     * Starts the chuck server.
     */
    public boot(): void {
        Object.assign(defaultConfig, this.config);

        //=> Launch Chuck by its main entry point
        require('./app_standalone');
    }
}
