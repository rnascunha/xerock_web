const path = require('path');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

module.exports = {
    plugins: [
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilemane: path.resolve(
                __dirname,
                '..',
                '..',
                './dist/report.html'
            ),
            openAnalyzer: false
        })
    ]
}