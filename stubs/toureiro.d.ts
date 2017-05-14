declare module 'toureiro' {
    import { Handler } from 'express';

    function toureiro(options: toureiro.IRedisOptions): Handler;

    namespace toureiro {
        interface IRedisOptions {
            redis: { host: string, port: number, db: number };
        }
    }

    export = toureiro;
}
