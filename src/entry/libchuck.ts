import defaultConfig, { IChuckConfig } from '../config';

//=> Export IChuckConfig
export { IChuckConfig, EnvType } from '../config';

//=> Export core symbols for writing plugin steps
export { IConversion } from '../models/IConversion';
export { ProgressFn, IStepDescription, IStepsContext, IStepModule } from '../converter/steps/step';

//=> Export core steps' context for reuse in plugin steps
export { IDownloadAssetsStepsContext } from '../converter/steps/01_download_assets';
export { IExecAssetBundleCompilerStepContext } from '../converter/steps/02_exec_assetbundlecompiler';

export function boot(config: Partial<IChuckConfig> = {}): void {
    Object.assign(defaultConfig, config);

    //=> Launch Chuck by its main entry point
    require('./standalone');
}
