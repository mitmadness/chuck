declare module 'sse-express' {
    import { NextFunction, Request, Response } from 'express';

    function sseExpress(req: Request, res: Response, next: NextFunction): void;

    namespace sseExpress {
        interface ISSEResponse extends Response {
            sse(eventName: string, payload: any, id?: number): void;
        }
    }

    export = sseExpress;
}
