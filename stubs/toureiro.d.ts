declare module 'toureiro' {
    import { Handler } from 'express';

    function toureiro(): Handler;

    namespace toureiro {
    }

    export = toureiro;
}
