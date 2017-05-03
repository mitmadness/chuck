import * as queue from 'bull';
import { Job } from 'bull';
import logger from '../logger';
import { IConversionJob, updateConversion } from './job';
import steps from './steps';

const sortedSteps = steps.sort((a, b) => a.describe().priority - b.describe().priority);

const conversionsQueue = queue('chuck-conversion-queue', process.env.REDIS_PORT, process.env.REDIS_HOST);

conversionsQueue.process(async (job: IConversionJob) => {
    await updateConversion(job, { 'conversion.jobId': job.jobId });

    for (const step of sortedSteps) {
        if (!step.shouldProcess(job)) return;

        const stepInfo = step.describe();

        const updateState = updateConversion(job, { 'conversion.progress.step': stepInfo.code });

        const signalProgress = job.progress({
            type: 'orchestrator',
            message: `Starting "${stepInfo.name}"`,
            step: stepInfo
        });

        await Promise.all([updateState, signalProgress]);

        await step.process(job);
    }

    await updateConversion(job, {
        'conversion.progress.completed': true,
        'conversion.progress.step': null
    });
});

//=> Global queue events
conversionsQueue.on('ready', () => logger.info('convqueue: Now ready'));
conversionsQueue.on('paused', () => logger.info('convqueue: Now paused'));
conversionsQueue.on('resumed', () => logger.info('convqueue: Now resumed'));
conversionsQueue.on('error', (err) => logger.error('convqueue: The queue encountered an error!', err));
conversionsQueue.on('cleaned', (jobs: IConversionJob[]) => {
    const jobIdsStr = jobs.map(job => job.jobId).join(', ');
    logger.info(`convqueue: ${jobs.length} terminated jobs have been deleted: ${jobIdsStr}`);
});

//=> Queue events regarding a particular job
// tslint:disable-next-line:max-line-length
conversionsQueue.on('progress', (job, progress) => logger.debug(`convqueue: job #${job.id} [${progress.type}] ${progress.message}`));
conversionsQueue.on('active', (job: Job) => logger.debug(`convqueue: job #${job.jobId} has started`, job.data));
conversionsQueue.on('completed', (job: Job) => logger.debug(`convqueue: job #${job.jobId} is completed`, job.data));
conversionsQueue.on('failed', (job: Job, err: any) => logger.error(`convqueue: job #${job.jobId} has failed!`, err));

export default conversionsQueue;
