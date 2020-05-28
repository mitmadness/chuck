import { Request, RequestHandler, Response, NextFunction } from 'express';
import { Document } from 'mongoose';

/**
 * This wrapper allows you to use a regular async function as express request handler
 * Used like this: router.post('/', wrapAsync(async (req, res, next) => { await something(); next(); }));
 * @param handler Your async handler for a given route
 */
export function wrapAsync(handler: RequestHandler): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => handler(req, res, next).catch(next);
}

/**
 * Clean a document when it is heading outside the server. Use this when outputing a document to the user
 * @param document The document to trim
 */
export function safeOutData<T extends Document>(document: T): Partial<T> {
    const safeDocument = document.toObject() as any;

    delete safeDocument.__v;
    delete safeDocument._id;

    return safeDocument;
}
