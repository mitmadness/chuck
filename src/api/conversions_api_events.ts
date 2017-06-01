import { sse, ISseResponse } from '@toverux/expresse';
import { compose } from 'compose-middleware';
import { Request, Response, NextFunction } from 'express';
import converterQueue from '../converter/queue';
import { IProgressReportJob } from '../converter/job';
import { IEvent, isQueueConversionEndedEvent } from '../converter/job_events';
import { Conversion, IConversionModel } from '../models/conversion';
import { wrapAsync } from '../express_utils';
import { GoneError, NotFoundError } from './http_errors';

interface InitSseRequest extends Request {
    isReplay: boolean;
    conversion: IConversionModel;
}

export default compose(
    //=> 1. Loads the conversion, checks request validity
    wrapAsync(loadConversion),
    //=> 2. Init SSE session
    sse(),
    //=> 3. Send conversion events (replay or realtime or both)
    wrapAsync(conversionSseEvents),
    //=> 4. Close connection
    terminateSseSession
);

async function loadConversion(req: InitSseRequest, res: Response, next: NextFunction): Promise<void> {
    req.isReplay = req.query.replay !== 'false';
    req.conversion = await Conversion.findOne({ code: req.params.code });

    //=> Check that we can continue
    if (!req.conversion) {
        throw new NotFoundError();
    } else if (!req.isReplay && req.conversion.conversion.isCompleted) {
        throw new GoneError('This conversion is terminated');
    }

    next();
}

async function conversionSseEvents(req: InitSseRequest, res: ISseResponse, next: NextFunction): Promise<void> {
    // @todo Unsafe typecast -- a Bull queue is an EventEmitter, but typings are not complete
    const emitterQueue = (converterQueue as any) as NodeJS.EventEmitter;
    const sse = sseSend.bind(null, req.query.sseType);

    //=> Replay mode: dump all progress records
    if (req.isReplay && req.conversion.conversion.logs) {
        req.conversion.conversion.logs.forEach(event => sse(res, event));

        // optim: conversion is terminated, don't watch for subsequent events
        if (req.conversion.conversion.isCompleted) return next();
    }

    //=> Listen queue for progress events, filter, and send if the jobId matches
    emitterQueue.on('progress', handleProgress);

    function handleProgress(job: IProgressReportJob, event: IEvent): void {
        if (job.id != req.conversion.conversion.jobId) return;
        sse(res, event);

        if (isQueueConversionEndedEvent(event)) {
            emitterQueue.removeListener('progress', handleProgress);
            next();
        }
    }
}

function terminateSseSession(req: Request, res: Response, next: NextFunction): void {
    res.end(); // avoid hanging for nothing, would be too easy to DDoS it
    next();
}

function sseSend(type: 'events'|'data', res: ISseResponse, event: IEvent): void {
    if (type == 'data') {
        res.sse.data(event);
    } else {
        const eventPayload = { ...event };
        delete eventPayload.type;

        res.sse.event(event.type, eventPayload);
    }
}
