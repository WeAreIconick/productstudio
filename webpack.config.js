const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
    ...defaultConfig,
    entry: {
        sidebar: './src/sidebar/index.js'
    }
};

