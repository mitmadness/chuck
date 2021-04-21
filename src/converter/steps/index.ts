import { IStepModule } from './step';
import * as downloadAssets from './01_download_assets';
import * as execAssetBundleCompiler from './02_exec_assetbundlecompiler';

export default [downloadAssets, execAssetBundleCompiler] as IStepModule[];
