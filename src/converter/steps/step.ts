import { IConversion } from '../../models/IConversion';

export type ProgressFn = (type: string, message: string, data?: any) => Promise<void>;

/**
 * This is the data sent between steps.
 */
export interface IStepsContext {
    [customKey: string]: any;

    /**
     * This is the expected result of the whole conversion
     */
    assetBundleUrl?: string; // mandatory ouput
}

export interface IStepDescription {
    /**
     * The id of the step
     */
    code: string;

    /**
     * The display name
     */
    name: string;

    /**
     * The priority is used to sort the steps (lower is sooner).
     */
    priority: number;
}

export interface IStepModule {
    /**
     * Allow Chuck to get the data on a step
     */
    describe(): IStepDescription;

    /**
     * Do we need to do this job in this case?
     * @param conversion The data on the conversion
     * @param context Output of previous steps
     */
    shouldProcess(conversion: IConversion, context: IStepsContext): boolean;

    /**
     * Do the actual job of the step
     * @param conversion The data on the conversion
     * @param context Output of previous steps
     * @param progress Callback to send progress reports
     */
    process(conversion: IConversion, context: IStepsContext, progress: ProgressFn): Promise<void>;

    /**
     * Optional function to clean once the job is done
     * @param context Output of previous steps
     */
    cleanup?(context: Readonly<IStepsContext>): Promise<void>;
}
