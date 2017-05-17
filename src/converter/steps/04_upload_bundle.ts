import * as azure from 'azure-storage';
import * as pify from 'pify';
import { IConversionJob } from '../job';
import { IStepDescription, IStepsContext } from './step';
import config from '../../config';

export interface IUploadBundleStepContext extends IStepsContext {
    assetBundlePath: string;
}

export function describe(): IStepDescription {
    return {
        code: 'upload-bundle',
        name: 'Upload the AssetBundle on Azure',
        priority: 40,
    };
}

export function shouldProcess(job: IConversionJob, context: IUploadBundleStepContext) {
    return !!(context.assetBundlePath);
}

export async function process(job: IConversionJob, context: IUploadBundleStepContext): Promise<void> {
    await job.progress({ type: 'exec-assetbundlecompiler', message: `Upload "${context.assetBundlePath}" to Azure` });

    let blobService: azure.BlobService;

    if (config.enableAzureEmulator) {
        const devStoreCreds = azure.generateDevelopmentStorageCredentials();
        blobService = azure.createBlobService(devStoreCreds);
    } else {
        blobService = azure.createBlobServiceWithSas(job.data.azure.host, job.data.azure.sharedAccessSignatureToken);
    }

    const blobName = job.data.assetBundleName;
    const container = job.data.azure.container;

    const createContainer = blobService.createContainerIfNotExists.bind(blobService);
    await pify(createContainer)(container, {publicAccessLevel : 'blob'});

    const createBlockBlobFromLocalFile = blobService.createBlockBlobFromLocalFile.bind(blobService);
    await pify(createBlockBlobFromLocalFile)(container, blobName, context.assetBundlePath);

    const blobUrl = blobService.getUrl(container, blobName);
    context.assetsPaths = context.assetsPaths.map(path => path = blobUrl);
}
