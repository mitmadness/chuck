import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import conversionsApi from './conversions_api';
import logger from '../logger';
import { HttpError } from './http_errors';

const router = express.Router();

router.use('/conversions', conversionsApi);

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
    //=> Headers already sent, let Express handle the thing
    if (res.headersSent) {
        return next(err);
    }

    //=> Mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json(err);
    }

    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({
            name: err.constructor.name,
            message: err.message
        });
    }

    //=> In all other cases, return a 500 error
    res.status(500).json({
        name: 'FatalError',
        message: 'Fatal server error - please retry'
    });

    //=> Log it because that's unexpected
    logger.error(err);
});

export default router;
