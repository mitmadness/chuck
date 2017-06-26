import * as raven from 'raven';
import config from '../config';
import logger from '../logger';
import { safeErrorSerialize } from '../safe_error_serialize';
import { IConversionJob, IProgressReportJob, updateConversion } from './job';
import { IEvent, isProcessorStepChangeEvent, queueConversionEndedEvent, queueConversionStartEvent } from './job_events';

// GLOBAL QUEUE EVENTS
//--------------------

export function onQueueReady(): void {
    logger.info('convqueue: Now ready');
}

export function onQueuePaused(): void {
    logger.info('convqueue: Now paused');
}

export function onQueueResumed(): void {
    logger.info('convqueue: Now resumed');
}

export function onQueueError(err: any): void {
    logger.error('convqueue: The queue encountered an error!', err);
}

export function onQueueCleaned(jobs: IConversionJob[]): void {
    const jobIdsStr = jobs.map(job => job.jobId).join(', ');
    logger.info(`convqueue: ${jobs.length} terminated jobs have been deleted: ${jobIdsStr}`);
}

// JOB-RELATED QUEUE EVENTS
//-------------------------

export async function onJobProgress(job: IProgressReportJob, progress: IEvent): Promise<void> {
    logger.verbose(`convqueue: job #${job.id} [${progress.type}] ${progress.message}`);

    let updateQuery = {
        $push: { 'conversion.logs': progress }
    };

    isProcessorStepChangeEvent(progress) && (updateQuery = {
        ...updateQuery,
        $set: { 'conversion.step': progress.step.code }
    });

    await updateConversion(job, updateQuery);
}

export async function onJobActive(job: IConversionJob): Promise<void> {
    logger.verbose(`convqueue: job #${job.jobId} has started`, job.data);

    await job.progress(queueConversionStartEvent('Conversion started'));
}

export async function onJobCompleted(job: IConversionJob, assetBundleUrl: string): Promise<void> {
    logger.verbose(`convqueue: job #${job.jobId} is completed`, job.data);

    await job.progress(queueConversionEndedEvent('Conversion terminated with success!', assetBundleUrl));

    await updateConversion(job, {
        $set: {
            'conversion.isCompleted': true,
            'conversion.step': null,
            'conversion.assetBundleUrl': assetBundleUrl
        }
    });
}

export async function onJobFailed(job: IConversionJob, error: any): Promise<void> {
    //=> Log & report on Sentry
    logger.error(`convqueue: job #${job.jobId} has failed!`, error);

    if (config.ravenDsn) {
        raven.captureException(error);
    }

    //=> Report in job's progress log
    const progressTask = job.progress(queueConversionEndedEvent(
        'Conversion failed, an error occured!', null, error
    ));

    //=> Update the conversion document infos about progress.
    //   We don't update conversion.step to let the client know where the fail occured.
    const updateTask = updateConversion(job, {
        $set: {
            'conversion.isCompleted': true,
            'conversion.error': safeErrorSerialize(error)
        }
    });

    await Promise.all([progressTask, updateTask]);
}
