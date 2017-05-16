import * as azure from 'azure-storage';
import * as pify from 'pify';
import * as path from 'path';
import { IConversionJob } from '../job';
import { IStepDescription, IStepsContext } from './step';

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
    return true;
}

export async function process(job: IConversionJob, context: IUploadBundleStepContext): Promise<void> {
    const devStoreCreds = azure.generateDevelopmentStorageCredentials();
    
    const blobService = azure.createBlobService(devStoreCreds);
    //const blobService = azure.createBlobService(job.data.azure.account, job.data.azure.key);
    
    const blobName = path.parse(context.assetBundlePath).name;

    await job.progress({ type: 'exec-assetbundlecompiler', message: `Upload "${context.assetBundlePath}" to Azure` });
    
    const createContainer = blobService.createContainerIfNotExists.bind(blobService);
    await pify(createContainer)(job.data.azure.container, {publicAccessLevel : 'blob'});

    const createBlockBlobFromLocalFile = blobService.createBlockBlobFromLocalFile.bind(blobService);
    await pify(createBlockBlobFromLocalFile)(job.data.azure.container, blobName, context.assetBundlePath);
}
