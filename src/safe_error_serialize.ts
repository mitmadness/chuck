export interface IPlainObjectError {
    name: string;
    message: string;
    errorId?: string;
    errors?: any[];
}

export function safeErrorSerialize(error: any, sentryErrorId?: string): IPlainObjectError {
    const plainError: any = {};

    //=> Error name
    plainError.name = error.name || error.constructor.name;

    //=> Error message
    plainError.message = error.message || 'Unknown error';

    //=> Set error's ID if given
    if (sentryErrorId) {
        plainError.errorId = sentryErrorId;
    }

    //=> Serialize recursively sub-errors if any
    if (error.errors) {
        plainError.errors = error.errors.map(safeErrorSerialize);
    }

    return plainError;
}
