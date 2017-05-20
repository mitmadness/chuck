import * as azure from 'azure-storage';
import { setInterval } from 'timers';
import config from '../../config';
import { IConversionJob } from '../job';
import { IStepDescription } from './step';
import { IExecAssetBundleCompilerStepContext } from './03_exec_assetbundlecompiler';

export interface IUploadBundleStepContext extends IExecAssetBundleCompilerStepContext {
    assetBundleUrl: string;
}

export function describe(): IStepDescription {
    return {
        code: 'upload-bundle',
        name: 'Upload the AssetBundle on Azure',
        priority: 40,
    };
}

export function shouldProcess(job: IConversionJob, context: IUploadBundleStepContext): boolean {
    return !!(context.assetBundlePath);
}

export async function process(job: IConversionJob, context: IUploadBundleStepContext): Promise<void> {
    await job.progress({ type: 'exec-assetbundlecompiler', message: `Upload "${context.assetBundlePath}" to Azure` });

    const blobService = getBlobService(job);

    const blobName = job.data.assetBundleName;
    const container = job.data.azure.container;

    return new Promise<void>((resolve, reject) => {
        let progressInterval: NodeJS.Timer;

        const upload = blobService.createBlockBlobFromLocalFile(
            container, blobName, context.assetBundlePath,
            async (err, blobResult) => {
                clearInterval(progressInterval);

                if (err) return reject(err);

                const url = blobService.getUrl(container, blobName);

                await job.progress({
                    type: 'upload-bundle',
                    message: `Upload ended with success`,
                    blobUrl: url, blobResult
                });

                context.assetBundleUrl = url;
                resolve();
            }
        );

        const total = upload.getTotalSize(true);

        // Please note that the Azure SDK updates the SpeedSummary object (here `upload`) only when
        // it finishes to upload a bloc (by default, a bloc has a size of 4M, configurable).
        // Moreover, a blob is cut down into blocs only if the total blob size exceed 32M (configurable).
        // So, if your final asset bundle is less than 32M, upload progress will stay at 0%.
        progressInterval = setInterval(async () => await job.progress({
            type: 'upload-bundle',
            message: `Upload progress: ${upload.getCompletePercent(0)} (${upload.getCompleteSize(true)}/${total})`,
            uploadStats: {
                totalSize: upload.totalSize,
                completeSize: upload.completeSize,
                completePercent: upload.getCompletePercent(2),
                averageSpeed: upload.getAverageSpeed(false)
            }
        }), 1000);
    });
}

function getBlobService(job: IConversionJob): azure.BlobService {
    if (config.enableAzureEmulator) {
        const devStoreCreds = azure.generateDevelopmentStorageCredentials();
        return azure.createBlobService(devStoreCreds);
    } else {
        return azure.createBlobServiceWithSas(job.data.azure.host, job.data.azure.sharedAccessSignatureToken);
    }
}
