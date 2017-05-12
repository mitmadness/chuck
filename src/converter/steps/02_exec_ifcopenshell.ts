import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as pify from 'pify';
import * as child_process from 'child_process';
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

export async function process(job: IConversionJob, context: IExecIfcStepsContext): Promise<void> {
    //=> Create a temporary folder for the assets
    const tmpDir = path.resolve(`${os.tmpdir()}/chuck-exec-ifcopenshell-${Date.now()}`);
    await pify(fs.mkdir)(tmpDir);

    context.convertedAssetsDir = tmpDir;
    context.convertedAssetsPaths = [];

    const conversions = context.downloadedAssetsPaths.map(async (path) => {
        await job.progress({ type: 'exec-ifcopenshell', message : `Converting "${path}" from IFC to Collada` });
        await convertAndStoreAssets(context, path);
    });

     //=> Await downloads and check if there are errors.
    let remainingConversions = conversions.length;
    const errors: any[] = [];

    return new Promise<void>((resolve, reject) => {
        conversions.forEach((dl) => {
            dl.then(() => {
                if (--remainingConversions == 0) {
                    if (errors.length) {
                        reject(new Error('Error(s) while downloadings'));
                    } else {
                        resolve();
                    }
                }
            }).catch(err => {
                --remainingConversions;
                errors.push(err);
            });
        });
    });
}

export async function convertAndStoreAssets(context: IExecIfcStepsContext, assetPath: string): Promise<string> {
    const fileName = path.parse(assetPath).name + ".dae";
    const filePath = path.resolve(`${context.convertedAssetsDir}/${fileName}`);
    return new Promise<string>((resolve, reject) => {
        child_process.execFile('IfcConvert',
        [assetPath, filePath, '-y', '--unicode', 'escape', '--use-element-hierarchy', '--use-element-types'],
        (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
                return;
            }
            resolve(filePath);
        });
    });
}
