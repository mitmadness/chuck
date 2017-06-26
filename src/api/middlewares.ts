import { BoomError, unauthorized } from 'boom';
import { ErrorRequestHandler, Handler, NextFunction, Request, Response } from 'express';
import logger from '../logger';
import { wrapAsync } from '../express_utils';
import { safeErrorSerialize } from '../safe_error_serialize';
import { isKeyValid } from './api_keys_cache';

interface ISentryResponse extends Response {
    sentry?: string;
}

export function hasValidApiKey(): Handler {
    return wrapAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw unauthorized('The API key must be provided in the Authorization header, with scheme Bearer');
        }

        const apiKey = authHeader.split(' ')[1];

        if (!await isKeyValid(apiKey)) {
            throw unauthorized(`The API key ${apiKey} does not seem to exist`);
        }

        next();
    });
}

export function recoverableErrorsHandler(): ErrorRequestHandler {
    return (err: any, req: Request, res: Response, next: NextFunction): void => {
        //=> Headers already sent, let Express handle the thing
        if (res.headersSent) {
            return void next(err);
        }

        //=> Mongoose validation errors
        if (err.name === 'ValidationError') {
            return void res.status(400).json(err);
        }

        //=> Boom's HTTP errors
        const boomError = err as BoomError;
        if (boomError.isBoom) {
            return void res.status(boomError.output.statusCode).json({
                name: boomError.output.payload.error,
                message: boomError.message
            });
        }

        //=> We can't recognize this error, pass to the next error handler.
        next(err);
    };
}

export function fatalErrorsHandler(): ErrorRequestHandler {
    return (err: any, req: Request, res: ISentryResponse, next: NextFunction): void => {
        //=> We don't know what this error is, return a 500 error
        res.status(500).json(safeErrorSerialize(err, res.sentry));

        //=> Log it because that's, well, unexpected
        logger.error(err);

        next();
    };
}
