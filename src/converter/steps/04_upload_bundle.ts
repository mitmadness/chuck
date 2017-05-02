import { IConversionJob } from '../job';
import { IStepDescription } from './step';

export function describe(): IStepDescription {
    return {
        code: 'upload-bundle',
        name: 'Upload the AssetBundle on Azure',
        priority: 40,
    };
}

export function shouldProcess(job: IConversionJob) {
    return true;
}

export function process(job: IConversionJob): Promise<void> {
    return Promise.resolve();
}
