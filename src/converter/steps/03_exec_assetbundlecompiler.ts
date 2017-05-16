import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as pify from 'pify';
import { BuildTargets, bundle} from '@mitm/assetbundlecompiler';
import { IConversionJob } from '../job';
import { IStepDescription, IStepsContext } from './step';

const { WebGL } = BuildTargets;

export interface IAssetBundleStepContext extends IStepsContext {
    assetBundleDir: string;
    assetBundlePath: string;
}

export function describe(): IStepDescription {
    return {
        code: 'exec-assetbundlecompiler',
        name: 'Execute AssetBundleCompiler to assemble the asset bundle',
        priority: 30,
    };
}

export function shouldProcess(job: IConversionJob, context : IAssetBundleStepContext) {
    if (context.assetsPaths == undefined) {
        return false;
    }
    if (!context.assetsPaths.length) {
        return false;
    }
    return true;
}

export async function process(job: IConversionJob, context: IAssetBundleStepContext ): Promise<void> {
    const tmpDir = path.resolve(`${os.tmpdir()}/chuck-exec-assetbundlecompiler-${Date.now()}`);
    const assetBundlePath = path.resolve(tmpDir, job.data.assetBundleName)

    await pify(fs.mkdir)(tmpDir);
    
    context.assetBundleDir = tmpDir;
    context.assetBundlePath = assetBundlePath;

    await bundle(...context.assetsPaths)
        .targeting(WebGL)
        .withLogger(async (log) => await job.progress({ type: 'exec-assetbundlecompiler', message: log }) )
        .to(assetBundlePath);
}

export async function cleanup(context: Readonly<IAssetBundleStepContext>): Promise<void> {
    await pify(fs.unlink)(context.assetBundlePath);
    await pify(fs.rmdir)(context.assetBundleDir);
}
