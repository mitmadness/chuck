import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';
import * as uuid from 'uuid';
import { IConversion } from './IConversion';

export type IConversionModel = IConversion & Document;

/**
 * More details on this in IConversion
 */
const ConversionSchema = new Schema({
    code: { type: String, unique: true, index: true, default: () => uuid.v4() },

    assetBundleName: { type: String, required: true },

    conversionOptions: {
        type: Array,
        default: [],
        validate(options: any[]) {
            return options.every(value => typeof value === 'string');
        }
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
    conversionOptions,
    compilerOptions
}: IConversion): Partial<IConversion> {
    return { assetBundleName, conversionOptions, compilerOptions };
}

export const Conversion = mongoose.model<IConversionModel>('Conversion', ConversionSchema);
