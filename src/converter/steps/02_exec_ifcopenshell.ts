import { IConversionJob } from '../job';
import { IStepDescription, IStepsContext } from './step';

export interface IExecIfcStepsContext extends IStepsContext {
    downloadedAssetsPaths: string[];
    convertedAssetsDir: string;
    convertedAssetsPaths: string[];
}

export function describe(): IStepDescription {
    return {
        code: 'exec-ifcopenshell',
        name: 'Execute IfcOpenShell to convert IFC files into Collada files',
        priority: 20,
    };
}

export function shouldProcess(job: IConversionJob, context: IExecIfcStepsContext) {
    if (context.downloadedAssetsPaths == undefined) {
        return false;
    }
    if (!context.downloadedAssetsPaths.length) {
        return false;
    }
    return true;
}

export function process(job: IConversionJob): Promise<void> {
    return Promise.resolve();
}
