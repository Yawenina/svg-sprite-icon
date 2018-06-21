const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.svg/,
        include: path.resolve(__dirname, './src/assets/icons'),
        loader: 'svg-sprite-loader'
      },
      {
        test: /\.vue/,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    // make sure to include the plugin for the magic
    new VueLoaderPlugin()
  ]
};
