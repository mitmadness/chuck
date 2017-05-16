import defaultConfig, { IChuckConfig } from '../config';

export { IConversionJob } from '../converter/job';
export { IStepModule, IStepDescription, IStepsContext } from '../converter/steps/step';
export { IDownloadAssetsStepsContext } from '../converter/steps/01_download_assets';

export default function chuck(config: Partial<IChuckConfig>): void {
    Object.assign(defaultConfig, config);

    //=> Boot Chuck
    require('./standalone');
}
