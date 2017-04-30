import { ApiKey } from '../models';

const apiKeysCache: string[] = [];

export async function isKeyValid(key: string): Promise<boolean> {
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
