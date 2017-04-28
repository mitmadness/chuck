import { Request, RequestHandler, Response, NextFunction } from 'express';

export function wrapAsync(handler: RequestHandler): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => handler(req, res, next).catch(next);
}
