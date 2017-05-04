import * as express from 'express';
import { Conversion, safeData as safeConversionData } from '../models/conversion';
import converterQueue from '../converter/queue';
import { wrapAsync, safeOutData } from '../express_utils';
import { NotFoundError } from './http_errors';
import { hasValidApiKey } from './middlewares';

const router = express.Router();

router.post('/', hasValidApiKey(), wrapAsync(async (req, res, next) => {
    const conversionData = safeConversionData(req.body);
    const conversion = await Conversion.create(conversionData);

    await converterQueue.add(conversion);

    res.status(202).json(safeOutData(conversion));

    next();
}));

router.get('/:code', wrapAsync(async (req, res, next) => {
    const conversion = await Conversion.findOne({ code: req.params.code });
    if (!conversion) {
        throw new NotFoundError();
    }

    res.status(200).json(safeOutData(conversion));

    next();
}));

export default router;
