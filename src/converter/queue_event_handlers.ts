import logger from '../logger';
import { safeErrorSerialize } from '../safe_error_serialize';
import { IConversionJob, IOrchestratorEvent, IProgressReportJob, updateConversion } from './job';

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

export async function onJobProgress(job: IProgressReportJob, progress: IOrchestratorEvent): Promise<void> {
    logger.verbose(`convqueue: job #${job.id} [${progress.type}] ${progress.message}`);

    if (progress.type == 'orchestrator') {
        await updateConversion(job, { 'conversion.progress.step': progress.step.code });
    }
}

export async function onJobActive(job: IConversionJob): Promise<void> {
    logger.verbose(`convqueue: job #${job.jobId} has started`, job.data);
}

export async function onJobCompleted(job: IConversionJob): Promise<void> {
    logger.verbose(`convqueue: job #${job.jobId} is completed`, job.data);

    await updateConversion(job, {
        'conversion.progress.completed': true,
        'conversion.progress.step': null
    });
}

export async function onJobFailed(job: IConversionJob, error: any): Promise<void> {
    logger.error(`convqueue: job #${job.jobId} has failed!`, error);

    // we don't update conversion.step to let the client know where the fail occured
    await updateConversion(job, {
        'conversion.progress.completed': true,
        'conversion.progress.error': safeErrorSerialize(error)
    });
}
