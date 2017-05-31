import * as express from 'express';
import { sse, ISseResponse } from '@toverux/expresse';
import { Conversion, safeData as safeConversionData, IConversionModel } from '../models/conversion';
import converterQueue from '../converter/queue';
import { IProgressReportJob } from '../converter/job';
import { IEvent, isQueueConversionEndedEvent } from '../converter/job_events';
import { wrapAsync, safeOutData } from '../express_utils';
import { GoneError, NotFoundError } from './http_errors';
import { hasValidApiKey } from './middlewares';

interface InitSseRequest extends express.Request {
    isReplay: boolean;
    conversion: IConversionModel;
}

const router: express.Router = express.Router();

router.post('/', hasValidApiKey(), wrapAsync(async (req, res, next) => {
    const conversionData = safeConversionData(req.body);
    const conversion = await Conversion.create(conversionData);

    const job = await converterQueue.add(conversion);

    conversion.conversion.jobId = job.jobId;
    await conversion.save();

    res.status(202).json(safeOutData(conversion));

    next();
}));

router.get('/:code', wrapAsync(async (req, res, next) => {
    const conversion = await Conversion.findOne({ code: req.params.code }, { 'conversion.logs': false });
    if (!conversion) {
        throw new NotFoundError();
    }

    res.status(200).json(safeOutData(conversion));

    next();
}));

router.get('/:code/events', wrapAsync(async (req: InitSseRequest, res, next) => {
    req.isReplay = req.query.replay !== 'false';
    req.conversion = await Conversion.findOne({ code: req.params.code });

    //=> Check that we can continue
    if (!req.conversion) {
        throw new NotFoundError();
    } else if (!req.isReplay && req.conversion.conversion.isCompleted) {
        throw new GoneError('This conversion is terminated');
    }

    next();
}), sse(), async (req: InitSseRequest, res: ISseResponse, next) => {
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
}, (req, res, next) => {
    res.end(); // avoid hanging for nothing, would be too easy to DDoS it
    next();
});

function sseSend(type: 'events'|'data', res: ISseResponse, event: IEvent): void {
    if (type == 'data') {
        res.sse.data(event);
    } else {
        const eventPayload = { ...event };
        delete eventPayload.type;

        res.sse.event(event.type, eventPayload);
    }
}

export default router;
