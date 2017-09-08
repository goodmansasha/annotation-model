const path = require('path'),
  merge = require('webpack-merge'),
  configBase = require('./webpack.base.conf'),
  UglifyEsPlugin = require('uglify-es-webpack-plugin'),
  resolve = function (dir) {
    return path.join(__dirname, '..', dir)
  }

const config = {
  output: {
    path: resolve('dist'),
    filename: '[name].min.js'
  },
  devtool: '#source-map',
  plugins: [
    new UglifyEsPlugin({
      sourceMap: true,
      minimize: true,
      compress: {
        warnings: true
      }
    })
  ]
}

module.exports = module.exports = merge(configBase, config)
