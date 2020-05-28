/**
 * The API key is stored on MongoDB.
 * If a key exists in the database, it is valid and may be used as authentication token for conversion requests.
 */
export interface IApiKey {
    key: string;
}
