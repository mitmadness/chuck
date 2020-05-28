/**
 * The type of a clean error
 */
export interface IPlainObjectError {
    name: string;
    message: string;

    /**
     * Error id on Sentry
     */
    errorId?: string;

    /**
     * Sub-errors
     */
    errors?: any[];
}

/**
 * This helper standardize and clean errors to get something readable to the user
 * @param error Your regular error
 * @param sentryErrorId When reported on the error server, this id is used to track it
 */
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
