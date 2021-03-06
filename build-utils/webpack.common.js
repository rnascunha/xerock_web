const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const Copy_Plugin = require("copy-webpack-plugin");
const Html_Webpack_Plugin = require('html-webpack-plugin');
const Workbox_Plugin = require('workbox-webpack-plugin');
const webpack = require('webpack');

module.exports = (public_path) => {
    return {
        entry: {
            //Main
            index: path.resolve(__dirname, '..', './src/index.js'),
            //Tools
            data_viewer: path.resolve(__dirname, '..', './src/tools/data_viewer/index.js'),
            data_converter: path.resolve(__dirname, '..', './src/tools/data_converter/index.js'),
            filter_tester: path.resolve(__dirname, '..', './src/tools/filter_tester/index.js'),
            coap_client: path.resolve(__dirname, '..', './src/tools/coap_client/index.js')
        },
        module: {
            rules: [
                {
                    test: /\.(js)$/,
                    exclude: /node_modules/, 
                    use: ['babel-loader']
                },
                {
                    test: /\.(css)$/,
                    exclude: [
                        path.resolve(__dirname, '..', './src/css'),
                        path.resolve(__dirname, '..', './src/tools')
                    ],
                    use: ['css-loader']
                }
            ]
        },
        resolve: {
            extensions: ['*', '.js']
        },
        plugins: [
            new CleanWebpackPlugin(),
            new Html_Webpack_Plugin({
                template: path.resolve(__dirname, '..', './src/index.html'),
                favicon: path.resolve(__dirname, '..', './icons/favicon.ico'),
                inject: true,
                chunks: ['index'],
            }),
            new Html_Webpack_Plugin({
                template: path.resolve(__dirname, '..', './src/tools/data_viewer/data_viewer.html'),
                favicon: path.resolve(__dirname, '..', './icons/favicon.ico'),
                filename: 'tools/data_viewer.html',
                publicPath: "../",
                inject: true,
                chunks: ['data_viewer']
            }),
            new Html_Webpack_Plugin({
                template: path.resolve(__dirname, '..', './src/tools/data_converter/data_converter.html'),
                favicon: path.resolve(__dirname, '..', './icons/favicon.ico'),
                filename: 'tools/data_converter.html',
                publicPath: "../",
                inject: true,
                chunks: ['data_converter']
            }),
            new Html_Webpack_Plugin({
                template: path.resolve(__dirname, '..', './src/tools/filter_tester/filter_tester.html'),
                favicon: path.resolve(__dirname, '..', './icons/favicon.ico'),
                filename: 'tools/filter_tester.html',
                publicPath: "../",
                inject: true,
                chunks: ['filter_tester']
            }),
            new Html_Webpack_Plugin({
                template: path.resolve(__dirname, '..', './src/tools/coap_client/coap_client.html'),
                favicon: path.resolve(__dirname, '..', './icons/favicon.ico'),
                filename: 'tools/coap_client.html',
                publicPath: "../",
                inject: true,
                chunks: ['coap_client']
            }),
            new Workbox_Plugin.GenerateSW({
                clientsClaim: true,
                skipWaiting: true,
                runtimeCaching: [{
                    urlPattern: /.*/,
                    handler: 'StaleWhileRevalidate',
                }]
            }),
            new webpack.DefinePlugin({
                publicPath: JSON.stringify(public_path),
            }),
            new Copy_Plugin({
                patterns: [
                    path.resolve(__dirname, '..', 'src', 'manifest.json'),
                    path.resolve(__dirname, '..', 'icons', "icon-192x192.png"),
                    path.resolve(__dirname, '..', 'icons', 'icon-256x256.png'),
                    path.resolve(__dirname, '..', 'icons', 'icon-384x384.png'),
                    path.resolve(__dirname, '..', 'icons', 'icon-512x512.png')
                ]    
            })
        ],
        output: {
            path: path.resolve(__dirname, '..', './dist/'),
            filename: '[name].[contenthash].js',
            publicPath: public_path
        },
        devServer: {
            contentBase: path.resolve(__dirname, '..', './dist/'),
            publicPath: public_path
        },
        optimization: {
            moduleIds: 'deterministic',
    //        runtimeChunk: 'single',
            splitChunks: {
                chunks: 'all',
                name(module) {
                    const moduleFileName = module.identifier().split(/[/\\]/).reduceRight(item => item);
                    return 'vendor-' + moduleFileName;
                },
            },
        },
    }
}
