import { IBuildOptionsMap } from '@mitm/assetbundlecompiler';
import { IEvent } from '../converter/job_events';

export interface IConversion {
    code: string;
    assetBundleName: string;
    assetUrls: string[];

    azure: {
        host: string;
        sharedAccessSignatureToken: string;
        container: string;
    };

    compilerOptions: {
        targeting: string;
        buildOptions: IBuildOptionsMap;
        editorScripts: string[];
    };

    conversion: {
        jobId: string|null;
        isCompleted: boolean;
        step: string|null;
        error: any|null;
        assetBundleUrl: string|null;
        logs: IEvent[]
    };
}
