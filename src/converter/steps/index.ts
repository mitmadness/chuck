import { IStepModule } from './step';
import * as downloadAssets from './01_download_assets';
import * as execIfcOpenShell from './02_exec_ifcopenshell';
import * as execAssetBundleCompiler from './03_exec_assetbundlecompiler';
import * as uploadBundle from './04_upload_bundle';

export default [downloadAssets, execIfcOpenShell, execAssetBundleCompiler, uploadBundle] as IStepModule[];
