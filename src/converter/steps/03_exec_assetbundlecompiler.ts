import { IConversionJob } from '../job';
import { IStepDescription } from './step';

export function describe(): IStepDescription {
    return {
        code: 'exec-assetbundlecompiler',
        name: 'Execute AssetBundleCompiler to assemble the asset bundle',
        priority: 30,
    };
}

export function shouldProcess(job: IConversionJob) {
    return true;
}

export function process(job: IConversionJob): Promise<void> {
    return Promise.resolve();
}
