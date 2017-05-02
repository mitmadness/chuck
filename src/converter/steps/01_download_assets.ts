import { IConversionJob } from '../job';
import { IStepDescription } from './step';

export function describe(): IStepDescription {
    return {
        code: 'download-assets',
        name: 'Download remote assets',
        priority: 10,
    };
}

export function shouldProcess(job: IConversionJob) {
    return true;
}

export function process(job: IConversionJob): Promise<void> {
    return Promise.resolve();
}
