import * as express from 'express';
import { sse, ISSECapableResponse } from '@toverux/expresse';
import { safeErrorSerialize } from '../safe_error_serialize';
import { Conversion, safeData as safeConversionData } from '../models/conversion';
import converterQueue from '../converter/queue';
import { IConversionEvent, IProgressReportJob } from '../converter/job';
import { wrapAsync, safeOutData } from '../express_utils';
import { GoneError, NotFoundError } from './http_errors';
import { hasValidApiKey } from './middlewares';

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

router.get('/:code/events', sse(), wrapAsync(async (req, res: ISSECapableResponse) => {
    const isReplay = req.query.replay !== 'false';

    const conversion = await Conversion.findOne({ code: req.params.code });
    if (!conversion) {
        return res.sse('error', safeErrorSerialize(new NotFoundError()));
    } else if (!isReplay && conversion.conversion.isCompleted) {
        return res.sse('error', safeErrorSerialize(new GoneError('This conversion is terminated')));
    }

    if (isReplay && conversion.conversion.logs) {
        conversion.conversion.logs.forEach(progress => res.sse(progress.type, progress));
    }

    //=> Listen queue for progress events, filter, and send if the jobId matches
    converterQueue.on('progress', (job: IProgressReportJob, progress: IConversionEvent) => {
        if (job.id != conversion.conversion.jobId) return;
        res.sse(progress.type, progress);
    });

    //=> Get the job instance and watch for completion (works even on replay mode)
    const job = await converterQueue.getJob(conversion.conversion.jobId as string);

    job.finished().then(
        () => res.sse('end-completed', 'Job finished with success'),
        err => res.sse('end-failed', safeErrorSerialize(err))
    );
}));

export default router;
