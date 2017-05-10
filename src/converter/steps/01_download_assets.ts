import { IConversionJob } from '../job';
import { IStepDescription } from './step';
import * as https from 'https';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

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

export function process(job: IConversionJob): Promise<{}> {
    job.context = {tempAssets: []};
    const promises = [];
    for(const url of job.data.assetUrls){
        const filename = url.split('/').reverse()[0];
        const filepath = os.tmpdir() + path.sep + Date.now() + '-' + filename;

        const p = new Promise((resolve,reject) =>
        https.get(url, (response) => {
            if(response.statusCode != 200) {
                reject(`error ${ response.statusCode } for ${url}`);
            }else{
                const file = fs.createWriteStream(filepath);
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    job.context.tempAssets.push(filepath);
                    resolve();
                });
            }
        }).on('error', (err) => {
            fs.unlink(filepath);
            reject(err);
            }));

        promises.push(p);
    }
    return Promise.all(promises);
}
