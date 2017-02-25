'use strict';
const path = require('path');
const webpack = require("webpack");
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');

module.exports = {
    watch: false,
    context: path.join(__dirname, "src"),
    entry: {
        main: './main.ts',
        vendors: './vendors.ts',
        //polyfills: './polyfills.ts',
    },
    output: {
        path: path.join(__dirname, 'auto-docs'),
        publicPath: '/',
        filename: '[name].js'
    },
    resolve: {
        modules: ['src'],
        extensions: ['.ts']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ignore-loader'
            },
            {
                test: /\.css$/,
                use: 'ignore-loader'
            },
            {
                test: /\.(scss|sass)$/,
                use: 'ignore-loader'
            },
        ]
    },
    plugins: [
        new TypedocWebpackPlugin({
            name: 'Webpack Boilerplate',
            mode: 'file',
            includeDeclarations: false,
            ignoreCompilerErrors: true,
            disableOutputCheck: true
        })
    ]
};
