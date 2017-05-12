import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as pify from 'pify';
import * as url from 'url';
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
    const downloads = job.data.assetUrls.map(async (url) => {
        await job.progress({ type: 'download-assets', message : `Downloading "${url}"` });
        await downloadAndStoreAsset(context, url, tmpDir);
    });

    //=> Await downloads and check if there are errors.
    let remainingDownloads = downloads.length;
    const errors: any[] = [];

    return new Promise<void>((resolve, reject) => {
        downloads.forEach((dl) => {
            dl.then(() => {
                if (--remainingDownloads == 0) {
                    if (errors.length) {
                        reject(new ExtendedError('Error(s) while downloadings', errors));
                    } else {
                        resolve();
                    }
                }
            }).catch(err => {
                --remainingDownloads;
                errors.push(err);
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

    //=> Pipe the HTTP response content to the write stream, then resolve
    return new Promise<string>((resolve) => {
        onlineAsset.pipe(localAsset).on('finish', () => {
            localAsset.close();
            context.downloadedAssetsPaths.push(filePath);

            resolve(filePath);
        });
    });
}

function downloadAsset(assetUrl: string): Promise<http.IncomingMessage> {
    return new Promise((resolve, reject) => {
        chooseGetProtocol(assetUrl)(assetUrl, (response) => {
            if (response.statusCode != 200) {
                reject(new Error(`HTTP error ${response.statusCode} for ${assetUrl}`));
                return;
            }

            resolve(response);
        });
    });
}

class ExtendedError extends Error {
    constructor(message: string, public errors: any[]) {
        super(message);

        Object.setPrototypeOf(this, ExtendedError.prototype);
    }
}

function chooseGetProtocol(inputUrl: string) {
    return url.parse(inputUrl).protocol == "https:" ? https.get : http.get;
}
