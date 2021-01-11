const path = require('path');
const Mini_Css_Extract_Plugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.(css)$/,
                include: [
                    path.resolve(__dirname, '..', './src/css'),
                    path.resolve(__dirname, '..', './src/tools')
                ],
                use: [
                    Mini_Css_Extract_Plugin.loader,
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
        new Mini_Css_Extract_Plugin()
    ]
}
