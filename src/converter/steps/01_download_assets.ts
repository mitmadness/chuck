import fetch from 'node-fetch';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as pify from 'pify';
import { IConversionJob } from '../job';
import { IStepDescription, IStepsContext } from './step';

export interface IDownloadAssetsStepsContext extends IStepsContext {
    downloadedAssetsDir: string;
    downloadedAssetsPaths: string[];
}

export function describe(): IStepDescription {
    return {
        code: 'download-assets',
        name: 'Download remote assets',
        priority: 10,
    };
}

export function shouldProcess(job: IConversionJob): boolean {
    return true;
}

export async function process(job: IConversionJob, context: IDownloadAssetsStepsContext): Promise<void> {
    //=> Create a temporary folder for the assets
    const tmpDir = path.resolve(`${os.tmpdir()}/chuck-dl-assets-${Date.now()}`);
    await pify(fs.mkdir)(tmpDir);

    context.downloadedAssetsDir = tmpDir;
    context.downloadedAssetsPaths = [];

    //=> Start downloading all assets
    const downloads = job.data.assetUrls.map(url => Promise.all([
        job.progress({ type: 'download-assets', message : `Downloading "${url}"` }),
        downloadAndStoreAsset(context, url, tmpDir)
    ]));

    //=> Await downloads and check if there are errors.
    let remainingDownloads = downloads.length;
    const errors: any[] = [];

    return new Promise<void>((resolve, reject) => {
        downloads.forEach((dl) => {
            dl.catch(err => errors.push(err)).then(() => {
                if (--remainingDownloads > 0) return;

                errors.length
                    ? reject(new MasterDownloadError('Error(s) while downloading assets', errors))
                    : resolve();
            });
        });
    });
}

export async function cleanup(context: Readonly<IDownloadAssetsStepsContext>): Promise<void> {
    const rms = context.downloadedAssetsPaths.map(path => pify(fs.unlink)(path));

    await Promise.all(rms);
    await pify(fs.rmdir)(context.downloadedAssetsDir);
}

async function downloadAndStoreAsset(
    context: IDownloadAssetsStepsContext,
    assetUrl: string,
    directory: string
): Promise<string> {
    //=> Find the dest path for the asset based on `directory`
    const fileName = assetUrl.split(/[?#]/)[0].split('/').reverse()[0];
    const filePath = path.resolve(`${directory}/${fileName}`);

    //=> Make HTTP request and create a write stream to the temp asset file
    const onlineAsset = await downloadAsset(assetUrl);
    const localAsset = fs.createWriteStream(filePath);

    context.downloadedAssetsPaths.push(filePath);

    //=> Pipe the HTTP response content to the write stream, then resolve
    return new Promise<string>((resolve) => {
        onlineAsset.pipe(localAsset).on('finish', () => {
            localAsset.close();

            context.assetsPaths.push(filePath);
            resolve(filePath);
        });
    });
}

async function downloadAsset(assetUrl: string): Promise<NodeJS.ReadableStream> {
    const response = await fetch(assetUrl);
    if (!response.ok) {
        throw new Error(`Server responded with HTTP error code ${response.status} while downloading ${assetUrl}`);
    }

    return response.body;
}

class MasterDownloadError extends Error {
    constructor(message: string, public errors: any[]) {
        super(message);

        Object.setPrototypeOf(this, MasterDownloadError.prototype);
    }
}
