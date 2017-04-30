import { ErrorRequestHandler, Handler, NextFunction, Request, Response } from 'express';
import logger from '../logger';
import { HttpError, UnauthorizedError } from './http_errors';
import { wrapAsync } from '../express_utils';
import { isKeyValid } from './api_keys_cache';

export function hasValidApiKey(): Handler {
    return wrapAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('The API key must be provided in the Authorization header, with scheme Bearer');
        }

        const apiKey = authHeader.split(' ')[1];

        if (!await isKeyValid(apiKey)) {
            throw new UnauthorizedError(`The API key ${apiKey} does not seem to exist`);
        }

        next();
    });
}

export function errorHandler(): ErrorRequestHandler {
    return (err: any, req: Request, res: Response, next: NextFunction): void => {
        //=> Headers already sent, let Express handle the thing
        if (res.headersSent) {
            return void next(err);
        }

        //=> Mongoose validation errors
        if (err.name === 'ValidationError') {
            return void res.status(400).json(err);
        }

        if (err instanceof HttpError) {
            return void res.status(err.statusCode).json({
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
    };
}
