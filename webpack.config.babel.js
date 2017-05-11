import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import webpackNodeExternals from 'webpack-node-externals';
import { isProductionBuild, fromRoot } from './environment';

const ENV_AGNOSTIC_CONFIG = {
    target: 'node',

    externals: [webpackNodeExternals()],

    entry: {
        libchuck: fromRoot('src/entry/libchuck.ts'),
        cli: fromRoot('src/entry/cli.ts'),
        standalone: fromRoot('src/entry/standalone.ts')
    },

    output: {
        path: fromRoot('dist'),
        filename: '[name].bundle.js',
        sourceMapFilename: '[name].bundle.map',
        libraryTarget: 'commonjs2'
    },

    plugins: [
        new webpack.BannerPlugin({
            banner: 'require("source-map-support").install();',
            raw: true,
            entryOnly: false
        }),
        new webpack.DefinePlugin({
            // The server uses the .env file or real env vars, but we'll override
            // process.env.WEBPACK_ENV to match the mode in which the server is built.
            'process.env.WEBPACK_ENV': JSON.stringify(process.env.WEBPACK_ENV)
        })
    ],

    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.ts$/,
                loader: 'tslint-loader'
            },
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader'
            }
        ]
    },

    resolve: {
        extensions: ['.ts', '.js', '.json'],
        modules: [fromRoot('node_modules')]
    },

    node: {
        global: true,
        crypto: 'empty',
        __dirname: false,  // false, to avoid the variable replacement by Webpack,
        __filename: false, // and keep the original Node __dirname/__filename globals.
        process: true,
        Buffer: true,
        clearImmediate: true,
        setImmediate: true
    }
};

const DEVELOPMENT_CONFIG = {
    devtool: 'source-map'
};

const PRODUCTION_CONFIG = {};

export default webpackMerge(
    ENV_AGNOSTIC_CONFIG,
    isProductionBuild ? PRODUCTION_CONFIG : DEVELOPMENT_CONFIG
);
