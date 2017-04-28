import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';
import * as uuid from 'uuid';

export interface IApiKey {
    key: string;
}

export type IModelApiKey = IApiKey & Document;

const ApiKeySchema = new Schema({
    key: { type: String, unique: true, index: true }
});

export const ApiKey = mongoose.model<IModelApiKey>('ApiKey', ApiKeySchema);

export function generateApiKey(): IModelApiKey {
    return new ApiKey({ key: uuid.v4() });
}
