'use strict';
const fs = require('fs');
const glob = require("glob");
const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const autoprefixer = require('autoprefixer');
const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    cache: false,
    watch: false,
    profile: false,

    context: path.join(__dirname, 'src'),
    entry: {
        main: './main.ts',
        vendors: './vendors.ts',
        polyfills: './polyfills.ts',
    },
    output: {
        path: path.join(__dirname, 'public'),
        publicPath: '',
        filename: '[name].[chunkhash].js',
        chunkFilename: '[id].[chunkhash].chunk.js'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: [path.join(__dirname, "src"),
            path.join(__dirname, 'node_modules')],
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.ts$/,
                loader: 'tslint-loader',
                exclude: [/(node_modules)/, /\.(spec|e2e)\.ts$/],
            },
            {
                test: /\.ts$/,
                use: 'awesome-typescript-loader',
                exclude: [/\.(spec|e2e)\.ts$/]
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    loader: ['css-loader']
                })
            },
            {
                test: /\.(scss|sass)$/,
                loader: ExtractTextPlugin.extract({
                    loader: ['css-loader?importLoaders=1',
                        'postcss-loader',
                        'sass-loader']
                })
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                loaders: ['file-loader?name=images/[name].[hash:20].[ext]',
                    {
                        loader: 'image-webpack-loader',
                        query: {
                            progressive: true,
                            mozjpeg: {
                                quality: 65
                            },
                            pngquant: {
                                quality: '65-90',
                                speed: 4
                            },
                            svgo: {
                                plugins: [
                                    {
                                        removeViewBox: false
                                    },
                                    {
                                        removeEmptyAttrs: false
                                    }
                                ]
                            }
                        }
                    }],
                exclude: [/\/assets\/fonts\//, path.join(__dirname, "node_modules")]
            },
            {
                test: /\.(svg|ttf|eot|woff|woff2)$/,
                use: 'file-loader?name=fonts/[name].[hash:20].[ext]',
                exclude: /\/assets\/images\//
            }
        ]
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new CleanWebpackPlugin(['./public']),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'polyfills',
            chunks: ['polyfills']
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendors',
            chunks: ['main'],
            minChunks: module => /node_modules\//.test(module.resource)
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: ['polyfills', 'vendors'].reverse()
        }),
        new webpack.ProvidePlugin({
            $: 'jquery/dist/jquery.js',
            jQuery: 'jquery/dist/jquery.js',
            'window.jQuery': 'jquery/dist/jquery.js',
            _: "lodash"
        }),
        new ExtractTextPlugin({
            filename: "[name].[chunkhash].css",
            disable: false,
            allChunks: true
        }),
        new OptimizeCssAssetsPlugin({
            cssProcessor: require('cssnano'),
            cssProcessorOptions: {
                discardComments: {removeAll: true},
            },
            canPrint: true
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: false,
            comments: false,
            beautify: false,
            compress: {
                warnings: false,
                sequences: true,
                dead_code: true,
                conditionals: true,
                comparisons: true,
                evaluate: true,
                booleans: true,
                loops: true,
                unused: true,
                hoist_funs: true,
                if_return: true,
                join_vars: true,
                cascade: true,
                side_effects: true,
                drop_console: true,
                negate_iife: false,
                screw_ie8: true
            },
            mangle: {
                keep_fnames: true,
                screw_ie8: true
            },
            output: {
                comments: false,
                screw_ie8: true
            }
        }),
        new webpack.DefinePlugin({
            'ENV': JSON.stringify("production"),
            'process.env': {
                'ENV': JSON.stringify("production"),
                'NODE_ENV': JSON.stringify("production")
            }
        }),
        new TsConfigPathsPlugin(),
        ...createHtmlLoaders(),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
            options: {
                context: __dirname,
                postcss: [
                    autoprefixer({browsers: ['last 3 version', 'IE >= 10', 'iOS >= 7', 'android >= 5']})
                ],
            },
        }),
    ],
    node: {
        global: true,
        crypto: 'empty',
        process: true,
        module: false,
        clearImmediate: false,
        setImmediate: false
    },
    performance: {
        hints: "warning",
        maxAssetSize: 2000000,
        maxEntrypointSize: 4000000,
        assetFilter: function (assetFilename) {
            return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
        }
    }
};

function root(__path) {
    return path.join(__dirname, __path);
}

function createHtmlLoaders() {
    let files = glob.sync("src/**/*.html", {ignore: ['src/modules/**']});
    let loaders = [];
    _.forEach(files, (file) => {
        loaders.push(new HtmlWebpackPlugin({
            filename: path.basename(file),
            template: _.replace(file, 'src/', './')
        }))
    });
    return loaders;
}
