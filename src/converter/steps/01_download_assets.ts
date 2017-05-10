import * as https from 'https';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { IConversionJob } from '../job';
import { IStepDescription } from './step';

export function describe(): IStepDescription {
    return {
        code: 'download-assets',
        name: 'Download remote assets',
        priority: 10,
    };
}

export function shouldProcess(job: IConversionJob) {
    return true;
}

export function process(job: IConversionJob) {
    job.context = {tempAssets: []};
    const promises = [];

    for(const url of job.data.assetUrls){
        const filename = url.split('/').reverse()[0];
        const filepath = os.tmpdir() + path.sep + Date.now() + '-' + filename;

        const p = new Promise<void>((resolve, reject) => {
            https.get(url, (response) => {
                if(response.statusCode != 200) {
                    reject(new Error(`error ${ response.statusCode } for ${url}`));
                    return;
                }

                const file = fs.createWriteStream(filepath);
                response.pipe(file);

                file.on('finish', () => {
                    file.close();
                    job.context.tempAssets.push(filepath);
                    resolve();
                });
            }).on('error', (err) => {
                fs.unlink(filepath);
                reject(err);
            });
        });

        promises.push(p);
    }

    return Promise.all(promises) as Promise<void>;
}
