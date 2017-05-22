import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as pify from 'pify';
import { bundle, setUnityPath } from '@mitm/assetbundlecompiler';
import config from '../../config';
import { IConversionJob } from '../job';
import { IStepDescription } from './step';
import { IDownloadAssetsStepsContext } from './01_download_assets';

export interface IExecAssetBundleCompilerStepContext extends IDownloadAssetsStepsContext {
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

export function shouldProcess(job: IConversionJob, context: IExecAssetBundleCompilerStepContext): boolean {
    return !!(context.assetsPaths && context.assetsPaths.length);
}

export async function process(job: IConversionJob, context: IExecAssetBundleCompilerStepContext): Promise<void> {
    const tmpDir = path.resolve(`${os.tmpdir()}/chuck-exec-assetbundlecompiler-${Date.now()}`);
    const assetBundlePath = path.join(tmpDir, job.data.assetBundleName);

    await pify(fs.mkdir)(tmpDir);

    context.assetBundleDir = tmpDir;
    context.assetBundlePath = assetBundlePath;

    if (config.unityPath) {
        setUnityPath(config.unityPath);
    }

    const options = job.data.compilerOptions;

    await bundle(...context.assetsPaths)
        .targeting(options.targeting)
        .includingEditorScripts(...options.editorScripts)
        .withBuildOptions(options.buildOptions)
        .withLogger(async (log) => await job.progress({ type: 'exec-assetbundlecompiler', message: log }) )
        .to(assetBundlePath);
}

export async function cleanup(context: Readonly<IExecAssetBundleCompilerStepContext>): Promise<void> {
    await pify(fs.unlink)(context.assetBundlePath);
    await pify(fs.rmdir)(context.assetBundleDir);
}
