import { ApiKey } from '../models';

const apiKeysCache: string[] = [];

/**
 * When setup Chuck, the user creates a key using the backoffice. This key is later reused in requests.
 * This methods checks in the database if the key exists.
 * @param key The key to check
 */
export async function isKeyValid(key: string): Promise<boolean> {
    // We use a cache to avoid checking in the database all the time
    if (apiKeysCache.includes(key)) {
        return true;
    }

    const apiKeyDocument = await ApiKey.findOne({ key });

    if (apiKeyDocument) {
        apiKeysCache.push(key);
        return true;
    }

    return false;
}
