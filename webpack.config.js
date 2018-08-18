const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const ExtractTextPlugin = require("extract-text-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const config = {
    mode : "development",
    entry: {
        EasyJS: './src/Modeler.ts',
        app: './src/app.ts'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: ['node_modules'],
        plugins: [ new TsConfigPathsPlugin({})]
    },
    output: {
        library: '[name]',
        // libraryTarget: 'var',
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
        devtoolModuleFilenameTemplate: '[absolute-resource-path]'
    },
    devtool: 'inline-source-map',
    optimization : {
        minimize : false,
        minimizer: [
            new UglifyJsPlugin({
              uglifyOptions: {
                compress: {
                  inline: false,
                },
                parallel: true,
              },
            }),
          ]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: ['awesome-typescript-loader', 'tslint-loader'],
                exclude: '/node_modules/'
            },
            {
                test: /\.s?css$/,
                use: [
                  MiniCssExtractPlugin.loader,
                  'css-loader',
                  'sass-loader'
                ]
         
            },
            {
                test: /\.html$/,
                use: ['html-loader']
            },
            {
                test: /\.(jpe?g|png|gif|svg|woff|woff2|ttf|eot)$/i,
                loaders: ['file-loader?hash=sha512&digest=hex&name=[hash].[ext]']
            },
            {
                test: /\.txt$/,
                use: 'raw-loader'
            }
        ]
    },
    node: {
        fs: 'empty'
      },
    
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        // extractPlugin,
        new MiniCssExtractPlugin(),
        new BrowserSyncPlugin({
            host: 'localhost',
            port: 9000,
            proxy: {
                target: 'http://localhost:9060'
            }
        }, {
            reload: false
        }),
        new webpack.NoEmitOnErrorsPlugin(),
        new HtmlWebpackPlugin({
            template: './demo/index.html',
            chunksSortMode: 'dependency',
            inject: 'body'
        }),
        new WebpackNotifierPlugin({
            title: 'SimpleDiagramEditor'
        }),

        new CleanWebpackPlugin(['dist']),
        new MonacoWebpackPlugin()
    ]
};

// Check if build is running in production mode, then change the sourcemap type
if (process.env.NODE_ENV === 'production') {
    // config.mode = "production";
    // config.devtool = ''; // No sourcemap for production
    config.optimization.minimize = true;
}

module.exports = config;
