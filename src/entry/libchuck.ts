import defaultConfig, { IChuckConfig } from '../config';

// -- LIB MODE --
// When using Chuck in lib mode, we don't start anything by default to avoid messing with the user error reporting
// But we allow the lib user to start the server using boot(), which run the standalone mode.
// The standalone mode will then import boostrap, adding the required error reporting.

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
