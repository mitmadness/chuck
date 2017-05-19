export interface IPlainObjectError {
    name: string;
    message: string;
    errors?: any[];
}

export function safeErrorSerialize(error: any): IPlainObjectError {
    const plainError: any = {};

    //=> Error name
    plainError.name = error.name || error.constructor.name;

    //=> Error message
    plainError.message = error.message || 'Unknown error';

    //=> Serialize recursively sub-errors if any
    if (error.errors) {
        plainError.errors = error.errors.map(safeErrorSerialize);
    }

    return plainError;
}
