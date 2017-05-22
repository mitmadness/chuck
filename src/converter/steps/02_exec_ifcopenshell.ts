import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as pify from 'pify';
import * as child_process from 'child_process';
import { IConversion } from '../../models';
import { IStepDescription, ProgressFn } from './step';
import { IDownloadAssetsStepsContext } from './01_download_assets';

export interface IExecIfcStepsContext extends IDownloadAssetsStepsContext {
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

export function shouldProcess(conv: IConversion, context: IExecIfcStepsContext) {
    return context.assetsPaths &&
        context.assetsPaths.length &&
        context.assetsPaths.some(assetPath => assetPath.toLowerCase().endsWith('.ifc'));
}

export async function process(conv: IConversion, context: IExecIfcStepsContext, progress: ProgressFn): Promise<void> {
    //=> Create a temporary folder for the assets
    const tmpDir = path.resolve(`${os.tmpdir()}/chuck-exec-ifcopenshell-${Date.now()}`);
    await pify(fs.mkdir)(tmpDir);

    context.convertedAssetsDir = tmpDir;
    context.convertedAssetsPaths = [];

    const conversions = context.assetsPaths.map(async (assetPath, index) => {
        if (assetPath.toLowerCase().endsWith('.ifc')) {
            await progress('convert-start', `Converting "${assetPath}" from IFC to Collada`);
            await convertAndStoreAssets(context, assetPath, index);
        }
    });

    //=> Await conversions and check if there are errors.
    let remainingConversions = conversions.length;
    const errors: any[] = [];

    return new Promise<void>((resolve, reject) => {
        conversions.forEach((conversion) => {
            conversion.then(() => {
                if (--remainingConversions == 0) {
                    if (errors.length) {
                        reject(new ConversionError('Error(s) while converting', errors));
                    } else {
                        resolve();
                    }
                }
            }).catch((err) => {
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

class ConversionError extends Error {
    constructor(message: string, public errors: any[]) {
        super(message);

        Object.setPrototypeOf(this, ConversionError.prototype);
    }
}

async function convertAndStoreAssets(
    context: IExecIfcStepsContext,
    assetPath: string,
    index: number
): Promise<string> {
    const fileName = path.parse(assetPath).name + '.dae';
    const filePath = path.resolve(`${context.convertedAssetsDir}/${fileName}`);

    return new Promise<string>((resolve, reject) => {
        child_process.execFile(
            'IfcConvert',
            [assetPath, filePath, '-y', '--unicode', 'escape', '--use-element-hierarchy', '--use-element-types'],
            (error, stdout) => {
                if (error) {
                    context.convertedAssetsPaths.push(`${filePath}.tmp`);
                    reject(stdout);
                    return;
                }

                context.convertedAssetsPaths.push(filePath);
                context.assetsPaths[index] = filePath;

                resolve(filePath);
            });
    });
}
