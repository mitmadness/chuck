import { DocumentQuery } from 'mongoose';
import { Job } from 'bull';
import { Conversion } from '../models';
import { IConversion } from '../models/IConversion';
import { IConversionModel } from '../models/conversion';
import { IEvent } from './job_events';

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
    progress<T extends IEvent>(event: T): Promise<void>;
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
