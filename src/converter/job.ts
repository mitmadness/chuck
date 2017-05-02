import { Job } from 'bull';
import { IConversion } from '../models';

export interface IConversionEvent {
    [customKey: string]: any;
    type: string;
    message: string;
}

export interface IConversionJob extends Job {
    data: IConversion;
    progress(event: IConversionEvent): Promise<void>;
}
