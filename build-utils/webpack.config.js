const {merge} = require('webpack-merge');
const common_config = require('./webpack.common.js');

const getAddons = addons_args => {
    const addons = Array.isArray(addons_args)
                    ? addons_args : [addons_args];
    
    return addons
        .filter(Boolean)
        .map(name => require(`./addons/webpack.${name}.js`));
}

module.exports = ({env, public_path, addon}) => {
    const env_config = require(`./webpack.${env}.js`);
    
    public_path = public_path ? public_path : '/';
    if(public_path.substr(-1) != '/') public_path += '/';
    console.log('publicPath:', public_path);
    
    return merge(common_config(public_path), env_config, ...getAddons(addon));
}