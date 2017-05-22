import { IConversion } from '../../models';

export type ProgressFn = (type: string, message: string, data?: any) => Promise<void>;

export interface IStepsContext {
    [customKey: string]: any;
    assetBundleUrl?: string; // mandatory ouput
}

export interface IStepDescription {
    code: string;
    name: string;
    priority: number;
}

export interface IStepModule {
    describe(): IStepDescription;
    shouldProcess(conversion: IConversion, context: IStepsContext): boolean;
    process(conversion: IConversion, context: IStepsContext, progress: ProgressFn): Promise<void>;
    cleanup?(context: Readonly<IStepsContext>): Promise<void>;
}
