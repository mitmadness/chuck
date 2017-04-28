import * as express from 'express';
import { Conversion } from '../models';
import { wrapAsync } from '../express_utils';

const router = express.Router();

router.post('/', wrapAsync(async (req, res, next) => {
    const conv = new Conversion(req.body);

    await conv.validate();

    res.status(202).end('ok');

    next();
}));

export default router;
