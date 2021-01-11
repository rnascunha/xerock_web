const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
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
            filter_tester: path.resolve(__dirname, '..', './src/tools/filter_tester/index.js')
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
                favicon: path.resolve(__dirname, '..', './src/favicon.ico'),
                inject: true,
                chunks: ['index'],
            }),
            new Html_Webpack_Plugin({
                template: path.resolve(__dirname, '..', './src/tools/data_viewer/data_viewer.html'),
                favicon: path.resolve(__dirname, '..', './src/favicon.ico'),
                filename: 'tools/data_viewer.html',
                inject: true,
                chunks: ['data_viewer']
            }),
            new Html_Webpack_Plugin({
                template: path.resolve(__dirname, '..', './src/tools/data_converter/data_converter.html'),
                favicon: path.resolve(__dirname, '..', './src/favicon.ico'),
                filename: 'tools/data_converter.html',
                inject: true,
                chunks: ['data_converter']
            }),
            new Html_Webpack_Plugin({
                template: path.resolve(__dirname, '..', './src/tools/filter_tester/filter_tester.html'),
                favicon: path.resolve(__dirname, '..', './src/favicon.ico'),
                filename: 'tools/filter_tester.html',
                inject: true,
                chunks: ['filter_tester']
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
