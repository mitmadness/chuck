import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as pify from 'pify';
import * as child_process from 'child_process';
import { IConversionJob } from '../job';
import { IStepDescription, IStepsContext } from './step';

export interface IExecIfcStepsContext extends IStepsContext {
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
    if (context.assetsPaths == undefined) {
        return false;
    }
    if (!context.assetsPaths.length) {
        return false;
    }
    if (!context.assetsPaths.some(assetPath => assetPath.toLowerCase().endsWith(".ifc"))) {
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

    const conversions = context.assetsPaths.map(async (assetPath, index) => {
        if (assetPath.toLowerCase().endsWith(".ifc")) {
            await job.progress({ type: 'exec-ifcopenshell', message: `Converting "${assetPath}" from IFC to Collada` });
            await convertAndStoreAssets(context, assetPath, index);
        }
    });

     //=> Await conversions and check if there are errors.
    let remainingConversions = conversions.length;
    const errors: any[] = [];

    return new Promise<void>((resolve, reject) => {
        conversions.forEach((dl) => {
            dl.then(() => {
                if (--remainingConversions == 0) {
                    if (errors.length) {
                        reject(new ExtendedError('Error(s) while converting', errors));
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

export async function cleanup(context: Readonly<IExecIfcStepsContext>): Promise<void> {
    const rms = context.convertedAssetsPaths.map(assetPath => pify(fs.unlink)(assetPath));

    await Promise.all(rms);
    await pify(fs.rmdir)(context.convertedAssetsDir);
}

class ExtendedError extends Error {
    constructor(message: string, public errors: any[]) {
        super(message);

        Object.setPrototypeOf(this, ExtendedError.prototype);
    }
}

async function convertAndStoreAssets(
    context: IExecIfcStepsContext,
    assetPath: string,
    index: number
): Promise<string> {
    const fileName = path.parse(assetPath).name + ".dae";
    const filePath = path.resolve(`${context.convertedAssetsDir}/${fileName}`);
    return new Promise<string>((resolve, reject) => {
        child_process.execFile('IfcConvert',
        [assetPath, filePath, '-y', '--unicode', 'escape', '--use-element-hierarchy', '--use-element-types'],
        (error, stdout, stderr) => {
            if (error) {
                context.convertedAssetsPaths.push(filePath + '.tmp');
                reject(stdout);
                return;
            }
            context.convertedAssetsPaths.push(filePath);
            context.assetsPaths[index] = filePath;
            resolve(filePath);
        });
    });
}
