import { Request, RequestHandler, Response, NextFunction } from 'express';
import { Document } from 'mongoose';

export function wrapAsync(handler: RequestHandler): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => handler(req, res, next).catch(next);
}

export function safeOutData<T extends Document>(document: T): Partial<T> {
    const safeDocument = document.toObject() as any;

    delete safeDocument.__v;
    delete safeDocument._id;

    return safeDocument;
}
