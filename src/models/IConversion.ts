import { IBuildOptionsMap } from '@mitm/assetbundlecompiler';
import { IEvent } from '../converter/job_events';

/**
 * A conversion is the data on a job. One conversion request => one IConversion in the database.
 */
export interface IConversion {
    /**
     * The identifier of the conversion. Used for instance to fetch events through the Rest API.
     */
    code: string;
    /**
     * The expected name of the resulting asset bundle
     */
    assetBundleName: string;
    /**
     * The list of files to bundle
     */
    assetUrls: string[];

    /**
     * A list of options intended for external steps (plugins)
     */
    conversionOptions: string[];

    /**
     * How to compile the assetBundle
     */
    compilerOptions: {
        targeting: string;
        buildOptions: IBuildOptionsMap;
        editorScripts: string[];
    };

    /**
     * Details on the ongoing job
     */
    conversion: {
        jobId: string|null;
        isCompleted: boolean;
        step: string|null;
        error: any|null;
        assetBundleUrl: string|null;
        logs: IEvent[]
    };
}
