import { IConversionJob } from '../job';

export interface IStepsContext {
    [customKey: string]: any;
}

export interface IStepDescription {
    code: string;
    name: string;
    priority: number;
}

export interface IStepModule {
    describe(): IStepDescription;
    shouldProcess(job: IConversionJob): boolean;
    process(job: IConversionJob, context: IStepsContext): Promise<void>;
    cleanup?(context: Readonly<IStepsContext>): Promise<void>;
}
