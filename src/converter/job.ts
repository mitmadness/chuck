import { DocumentQuery } from 'mongoose';
import { Job } from 'bull';
import { Conversion, IConversion } from '../models';
import { IConversionModel } from '../models/conversion';
import { IStepDescription } from './steps/step';

export interface IConversionEvent {
    type: string;
    message: string;
}

export interface IProcessorStepChangeEvent extends IConversionEvent {
    type: 'processor/step-change';
    step: IStepDescription;
}

export function isProcessorStepChangeEvent(event: IConversionEvent): event is IProcessorStepChangeEvent {
    return event.type === 'processor/step-change';
}

export interface IProcessorCleanupErrorEvent extends IConversionEvent {
    type: 'processor/cleanup-error';
    step: IStepDescription;
    error: any;
}

export interface IConversionEndedEvent extends IConversionEvent {
    type: 'conversion-ended';
    error?: any;
    assetBundleUrl?: string;
}

export function isConversionEndedEvent(event: IConversionEvent): event is IConversionEndedEvent {
    return event.type === 'conversion-ended';
}

/**
 * This interface is the common subset of a normal Job object (w/ methods) and a job in a progress report.
 */
export interface IConversionDataJob {
    data: IConversion;
}

/**
 * This is a more-typed specialization of Bull's Job interface.
 * This is a normal Job object with methods like progress().
 */
export interface IConversionJob extends Job {
    data: IConversion;
    progress<T extends IConversionEvent>(event: T): Promise<void>;
}

/**
 * This is an imperfect subset of a normal Job object.
 * It has no methods (plain object) and has "id" instead of "jobId".
 * It is received is a progress event handler, for example.
 */
export interface IProgressReportJob {
    id: string;
    data: IConversion;
}

export function updateConversion(job: IConversionDataJob, update: object): DocumentQuery<any, IConversionModel> {
    return Conversion.findOneAndUpdate({ code: job.data.code }, update);
}
