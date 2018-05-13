// const path = require('path');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const ExtractTextPlugin = require("extract-text-webpack-plugin");
// const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
// const CleanWebpackPlugin = require('clean-webpack-plugin');
// const WebpackNotifierPlugin = require('webpack-notifier');
// const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

// module.exports = {
// 	entry: './src/Diagram.ts',
// 	module: {
// 		rules: [
// 			{
// 				test: /\.tsx?$/,
// 				use: 'ts-loader',
// 				exclude: /node_modules/
// 			},
// 			{
// 				test: /\.css$/,
// 				use: ['style-loader', 'css-loader']
// 			},
// 			{
// 				test: /\.(jpg|png|gif|svg)$/,
// 				use: [
// 					{
// 						loader: 'file-loader',
// 						options: {
// 							name: '[name].[ext]'
// 						}
// 					}, 'image-webpack-loader'
// 				]
// 			}
// 		]
// 	},
// 	resolve: {
// 		extensions: [ '.ts', '.js' ]
// 	},
// 	output: {
// 		filename: 'bundle.js',
// 		path: path.resolve(__dirname, 'dist')
// 	},
// 	devServer: {
// 		contentBase: './example/app'
// 	},
// 	plugins: [
// 		new UglifyJSPlugin()
// 	],
// };

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');


const extractPlugin = new ExtractTextPlugin({
    filename: 'main.css'
});


const config = {
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
        libraryTarget: 'var',
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: ['awesome-typescript-loader', 'tslint-loader'],
                exclude: '/node_modules/'
            },
            {
                test: /\.html$/,
                use: ['html-loader']
            },
            {
                test: /\.(jpe?g|png|gif|svg|woff|woff2|ttf|eot)$/i,
                loaders: ['file-loader?hash=sha512&digest=hex&name=[hash].[ext]']
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
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

        new CleanWebpackPlugin(['dist'])
    ]
};

// Check if build is running in production mode, then change the sourcemap type
// if (process.env.NODE_ENV === 'production') {
//     console.log('production mode run UglifyJsPlugin');
//     config.devtool = ''; // No sourcemap for production
//     config.plugins.push(new webpack.optimize.UglifyJsPlugin({
//         parallel: true,
//         uglifyOptions: {
//             ie8: false,
//             ecma: 8
//         }
//     }));
// }

module.exports = config;
