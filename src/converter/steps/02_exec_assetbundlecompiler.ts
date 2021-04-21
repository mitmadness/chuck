import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as pify from 'pify';
import * as sanitize from 'sanitize-filename';
import { bundle, setUnityPath } from '@mitm/assetbundlecompiler';
import config from '../../config';
import { IConversion } from '../../models/IConversion';
import {IStepDescription, IStepsContext, ProgressFn} from './step';

// -- STEP 02 --
// This step bundle all the files in the assetsPaths field of the context (the data blob transfered between steps)
// and bundle it with Unity using the options given by the user.
// The result is stored in assetBundlePath for upload by STEP 03.

export interface IExecAssetBundleCompilerStepContext extends IStepsContext {
    /**
     * Where is the generated asset? This is used to clean afterwards.
     */
    assetBundleDir: string;
    /**
     * What is the generated asset path? This is used:
     *  - for the 03_upload_bundle
     *  - to clean afterwards.
     */
    assetBundlePath: string;
}

export function describe(): IStepDescription {
    return {
        code: 'exec-assetbundlecompiler',
        name: 'Execute AssetBundleCompiler to assemble the asset bundle',
        priority: 20
    };
}

export function shouldProcess(conv: IConversion, context: IExecAssetBundleCompilerStepContext): boolean {
    return !!(context.assetsPaths && context.assetsPaths.length);
}

export async function process(
    conv: IConversion,
    context: IExecAssetBundleCompilerStepContext,
    progress: ProgressFn
): Promise<void> {
    const tmpDir = path.resolve(`${os.tmpdir()}/chuck-exec-assetbundlecompiler-${Date.now()}`);
    const sanitizedBundleName = sanitize(conv.assetBundleName).trim().toLowerCase();
    const assetBundlePath = path.join(tmpDir, sanitizedBundleName);

    await pify(fs.mkdir)(tmpDir);

    context.assetBundleDir = tmpDir;
    context.assetBundlePath = assetBundlePath;

    if (config.unityPath) {
        setUnityPath(config.unityPath);
    }

    const options = conv.compilerOptions;

    await bundle(...context.assetsPaths)
        .targeting(options.targeting)
        .includingEditorScripts(...options.editorScripts)
        .withBuildOptions(options.buildOptions)
        .withLogger(async log => await progress('abcompiler-log', log))
        .to(assetBundlePath);
}

export async function cleanup(context: Readonly<IExecAssetBundleCompilerStepContext>): Promise<void> {
    await pify(fs.unlink)(context.assetBundlePath);
    await pify(fs.rmdir)(context.assetBundleDir);
}
