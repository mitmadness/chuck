// tslint:disable:max-classes-per-file

export abstract class HttpError extends Error {
    // tslint:disable-next-line:ban-types
    constructor(public statusCode: number, message: string, ctor: Function = HttpError) {
        super(message);

        Object.setPrototypeOf(this, ctor.prototype);
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string = 'Unable to find requested entity') {
        super(404, message, NotFoundError);
    }
}
