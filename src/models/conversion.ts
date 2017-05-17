import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';
import * as uuid from 'uuid';

export interface IConversion {
    code: string;
    assetBundleName: string;
    assetUrls: string[];
    azure: {
        account: string;
        key: string;
        container: string;
    };
    conversion: {
        jobId: string|null;
        progress: {
            completed: boolean;
            step: string|null;
            error: any|null;
        };
    };
}

export type IConversionModel = IConversion & Document;

const ConversionSchema = new Schema({
    code: { type: String, unique: true, index: true, default: () => uuid.v4() },

    assetBundleName: { type: String, required: true },

    assetUrls: {
        type: Array,
        required: true,
        validate(urls: any[]) {
            return urls.every(value => typeof value === 'string');
        }
    },

    azure: {
        account: { type: String, required: true },
        key: { type: String, required: true },
        container: { type: String, required: true }
    },

    conversion: {
        jobId: { type: String, default: null },
        progress: {
            completed: { type: Boolean, default: false },
            step: { type: String, default: null },
            error: { type: Schema.Types.Mixed, default: null }
        }
    }
});

export function safeData({
    assetBundleName,
    assetUrls,
    azure
}: IConversion) {
    return { assetBundleName, assetUrls, azure };
}

export const Conversion = mongoose.model<IConversionModel>('Conversion', ConversionSchema);
