import * as azure from 'azure-storage';
import * as pify from 'pify';
import * as sanitize from 'sanitize-filename';
import config from '../../config';
import { IConversion } from '../../models/IConversion';
import { IStepDescription, ProgressFn } from './step';
import { IExecAssetBundleCompilerStepContext as ICompilerStepContext } from './02_exec_assetbundlecompiler';

// -- STEP 03 --
// This step upload the file at assetBundlePath (in the context, transfered between steps) to Azure using the data
// given by the user.
// The resulting URL is stored in assetBundleUrl.

export function describe(): IStepDescription {
    return {
        code: 'upload-bundle',
        name: 'Upload the AssetBundle on Azure',
        priority: 30
    };
}

export function shouldProcess(): boolean {
    return true;
}

export async function process(conv: IConversion, context: ICompilerStepContext, progress: ProgressFn): Promise<void> {
    await progress('upload-start', `Uploading "${context.assetBundlePath}" to Azure`);

    const blobService = getBlobService(conv);

    const blobName = sanitize(conv.assetBundleName).trim().toLowerCase();
    const container = conv.azure.container;

    const createBlob = pify(blobService.createBlockBlobFromLocalFile.bind(blobService));
    const blobResult = await createBlob(container, blobName, context.assetBundlePath);

    const blobUrl = blobService.getUrl(container, blobName);

    await progress('upload-end', 'Upload terminated with success', { blobUrl, blobResult });

    context.assetBundleUrl = blobUrl;
}

function getBlobService(conv: IConversion): azure.BlobService {
    if (config.azure.enableEmu) {
        const devStoreCreds = azure.generateDevelopmentStorageCredentials();
        return azure.createBlobService(devStoreCreds);
    } else {
        return azure.createBlobServiceWithSas(conv.azure.host, conv.azure.sharedAccessSignatureToken);
    }
}
