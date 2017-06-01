import * as express from 'express';
import { Conversion, safeData as safeConversionData } from '../models/conversion';
import converterQueue from '../converter/queue';
import { wrapAsync, safeOutData } from '../express_utils';
import conversionsEventsMiddleware from './conversions_api_events';
import { NotFoundError } from './http_errors';
import { hasValidApiKey } from './middlewares';

const router: express.Router = express.Router();

/**
 * Create a new conversion request.
 * Creates a Conversion document, and pushes it onto the queue - the job will start asap.
 */
router.post('/', hasValidApiKey(), wrapAsync(async (req, res, next) => {
    const conversionData = safeConversionData(req.body);
    const conversion = await Conversion.create(conversionData);

    const job = await converterQueue.add(conversion);

    conversion.conversion.jobId = job.jobId;
    await conversion.save();

    res.status(202).json(safeOutData(conversion));

    next();
}));

/**
 * Retrieves a conversion request by it's code identifier.
 */
router.get('/:code', wrapAsync(async (req, res, next) => {
    const conversion = await Conversion.findOne({ code: req.params.code }, { 'conversion.logs': false });
    if (!conversion) {
        throw new NotFoundError();
    }

    res.status(200).json(safeOutData(conversion));

    next();
}));

/**
 * A Server-Sent Events endpoint to get realtime events about the conversion.
 */
router.get('/:code/events', conversionsEventsMiddleware);

export default router;
