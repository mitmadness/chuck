// tslint:disable:max-classes-per-file

export abstract class HttpError extends Error {
    // tslint:disable-next-line:ban-types
    constructor(public statusCode: number, message: string, ctor: Function = HttpError) {
        super(message);

        Object.setPrototypeOf(this, ctor.prototype);
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message: string = 'Access denied because of missing credentials in request') {
        super(401, message, UnauthorizedError);
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string = 'Unable to find requested entity') {
        super(404, message, NotFoundError);
    }
}
