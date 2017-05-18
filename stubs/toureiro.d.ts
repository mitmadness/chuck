declare module 'toureiro' {
    import { RequestHandler } from 'express';

    function toureiro(options: toureiro.IRedisOptions): RequestHandler;

    namespace toureiro {
        interface IRedisOptions {
            redis: { host: string, port: number, db: number, auth_pass?: string };
        }
    }

    export = toureiro;
}
