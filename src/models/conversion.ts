import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';
import * as uuid from 'uuid';
import { IConversion } from './IConversion';

export { IConversion };

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
        host: { type: String, required: true },
        sharedAccessSignatureToken: { type: String, required: true },
        container : { type: String, required: true }
    },

    compilerOptions: {
        targeting: { type: String, required: true },
        buildOptions: {
            type: Schema.Types.Mixed,
            default: {}
        },
        editorScripts: {
            type: Array,
            default: [],
            validate(script: any[]) {
                return script.every(value => typeof value === 'string');
            }
        }
    },

    conversion: {
        jobId: { type: String, default: null },
        isCompleted: { type: Boolean, default: false },
        step: { type: String, default: null },
        error: { type: Schema.Types.Mixed, default: null },
        assetBundleUrl: { type: String, default: null },
        logs: [
            { type: Schema.Types.Mixed, default: [] }
        ]
    }
}, { minimize: false });

export function safeData({
    assetBundleName,
    assetUrls,
    azure,
    compilerOptions
}: IConversion): Partial<IConversion> {
    return { assetBundleName, assetUrls, azure, compilerOptions };
}

export const Conversion = mongoose.model<IConversionModel>('Conversion', ConversionSchema);
