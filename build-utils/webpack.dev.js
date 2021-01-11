const path = require('path');

module.exports = {
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.(css)$/,
                include: [
                    path.resolve(__dirname, '..', './src/css'),
                    path.resolve(__dirname, '..', './src/tools')
                ],
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    devtool: 'eval-source-map'
}