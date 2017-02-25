'use strict';
const fs = require('fs');
const glob = require("glob");
const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    cache: true,
    watch: true,
    profile: false,

    devtool: 'source-map',
    context: path.join(__dirname, 'src'),
    entry: {
        main: './main.ts',
        vendors: './vendors.ts',
        //polyfills: './polyfills.ts',
    },
    output: {
        path: path.join(__dirname, 'public'),
        publicPath: '',
        filename: '[name].js',
        chunkFilename: '[id].chunk.js',
        sourceMapFilename: "[file].map"
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
                use: 'tslint-loader',
                exclude: [/(node_modules)/, /\.(spec|e2e)\.ts$/],
            },
            {
                test: /\.ts$/,
                use: 'awesome-typescript-loader',
                exclude: [/\.(spec|e2e)\.ts$/]
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: ['css-loader?sourceMap=true']
                })
            },
            {
                test: /\.(scss|sass)$/,
                use: ExtractTextPlugin.extract({
                    use: ['css-loader?sourceMap=true&importLoaders=1',
                        'sass-loader?sourceMap=true']
                })
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                use: 'file-loader?name=images/[name].[ext]',
                exclude: [/\/assets\/fonts\//, path.join(__dirname, "node_modules")]
            },
            {
                test: /\.(svg|ttf|eot|woff|woff2)$/,
                use: 'file-loader?name=fonts/[name].[ext]',
                exclude: /\/assets\/images\//
            },
        ]
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
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
            'Tether': 'tether/dist/js/tether.js',
            _: "lodash"
        }),
        new ExtractTextPlugin({
            filename: "[name].css",
            disable: false,
            allChunks: true
        }),
        new webpack.DefinePlugin({
            'ENV': JSON.stringify("development"),
            'process.env': {
                'ENV': JSON.stringify("development"),
                'NODE_ENV': JSON.stringify("development")
            }
        }),
        new TsConfigPathsPlugin(),
        ...createHtmlLoaders(),
        new CopyWebpackPlugin([
            { from: 'meta'}
        ]),
        new webpack.LoaderOptionsPlugin({
            debug: true,
            options: {
                context: __dirname,
            }
        })
    ],
    devServer: {
        port: 7300,
        host: 'localhost',
        publicPath: '',
        historyApiFallback: true,
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        },
        inline: true,
        compress: true,
        contentBase: path.join(__dirname, 'public'),
        hot: false
    },
    node: {
        global: true,
        crypto: 'empty',
        process: true,
        module: false,
        clearImmediate: false,
        setImmediate: false
    },
    performance: {
        hints: false
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
            favicon: path.join(__dirname, 'src/favicon.ico'),
            filename: path.basename(file),
            template: _.replace(file, 'src/', './'),
            attrs: ['img:src', 'link:href']
        }))
    });
    return loaders;
}
