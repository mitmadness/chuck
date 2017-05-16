import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as pify from 'pify';
import { BuildTargets, bundle} from '@mitm/assetbundlecompiler';
import { IConversionJob } from '../job';
import { IStepDescription, IStepsContext } from './step';

const { WebGL } = BuildTargets;

export interface IAssetBundleStepsContext extends IStepsContext {
    assetBundleDir: string;
}

export function describe(): IStepDescription {
    return {
        code: 'exec-assetbundlecompiler',
        name: 'Execute AssetBundleCompiler to assemble the asset bundle',
        priority: 30,
    };
}

export function shouldProcess(job: IConversionJob) {
    return true;
}

export async function process(job: IConversionJob, context: IAssetBundleStepsContext ): Promise<void> {
    const tmpDir = path.resolve(`${os.tmpdir()}/chuck-exec-assetbundlecompiler-${Date.now()}`);
    await pify(fs.mkdir)(tmpDir);
    context.assetBundleDir = tmpDir;

    await bundle(...context.assetsPaths)
        .targeting(WebGL)
        .withLogger(async (log) => await job.progress({ type: 'exec-assetbundlecompiler', message: log }) )
        .to(path.resolve(tmpDir, job.data.assetBundleName));
}
