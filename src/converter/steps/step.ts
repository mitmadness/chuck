import { IConversionJob } from '../job';

export interface IStepDescription {
    code: string;
    name: string;
    priority: number;
}

export interface IStepModule {
    describe(): IStepDescription;
    shouldProcess(job: IConversionJob): boolean;
    process(job: IConversionJob): Promise<void>;
}
