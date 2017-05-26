import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';
import * as uuid from 'uuid';
import { IApiKey } from './IApiKey';

export type IApiKeyModel = IApiKey & Document;

const ApiKeySchema = new Schema({
    key: { type: String, unique: true, index: true, default: () => uuid.v4() }
});

export const ApiKey = mongoose.model<IApiKeyModel>('ApiKey', ApiKeySchema);
