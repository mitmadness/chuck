import * as queue from 'bull';
import { Job } from 'bull';
import logger from '../logger';
import { IConversionJob } from './job';
import steps from './steps';
import { processor } from './queue_processor';

// QUEUE INITIALIZATION
//---------------------

//=> Sort all steps with their declared priority
const sortedSteps = steps.sort((a, b) => a.describe().priority - b.describe().priority);

//=> Initialize the Bull queue
const conversionsQueue = queue('chuck-conversion-queue', process.env.REDIS_PORT, process.env.REDIS_HOST);

//=> Initialize the job processor for the conversions queue
conversionsQueue.process(processor.bind(null, sortedSteps));

// GLOBAL QUEUE EVENTS
//--------------------

conversionsQueue.on('ready', () => logger.info('convqueue: Now ready'));

conversionsQueue.on('paused', () => logger.info('convqueue: Now paused'));

conversionsQueue.on('resumed', () => logger.info('convqueue: Now resumed'));

conversionsQueue.on('error', (err) => logger.error('convqueue: The queue encountered an error!', err));

conversionsQueue.on('cleaned', (jobs: IConversionJob[]) => {
    const jobIdsStr = jobs.map(job => job.jobId).join(', ');
    logger.info(`convqueue: ${jobs.length} terminated jobs have been deleted: ${jobIdsStr}`);
});

// JOB-RELATED QUEUE EVENTS
//-------------------------

conversionsQueue.on('progress', (job, progress) => {
    logger.debug(`convqueue: job #${job.id} [${progress.type}] ${progress.message}`);
});

conversionsQueue.on('active', (job: Job) => logger.debug(`convqueue: job #${job.jobId} has started`, job.data));

conversionsQueue.on('completed', (job: Job) => logger.debug(`convqueue: job #${job.jobId} is completed`, job.data));

conversionsQueue.on('failed', (job: Job, err: any) => logger.error(`convqueue: job #${job.jobId} has failed!`, err));

export default conversionsQueue;
