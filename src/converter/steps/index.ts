import { IStepModule } from './step';
import * as downloadAssets from './01_download_assets';
import * as execAssetBundleCompiler from './02_exec_assetbundlecompiler';
import * as uploadBundle from './03_upload_bundle';

export default [downloadAssets, execAssetBundleCompiler, uploadBundle] as IStepModule[];
