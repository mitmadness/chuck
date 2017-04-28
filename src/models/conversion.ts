import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';
import * as uuid from 'uuid';

export interface IConversion {
    key: string;
}

export type IConversionModel = IConversion & Document;

const ConversionSchema = new Schema({
    code: { type: String, unique: true, index: true, default: () => uuid.v4() },

    assetBundleName: { type: String, required: true }
});

export const Conversion = mongoose.model<IConversionModel>('Conversion', ConversionSchema);
