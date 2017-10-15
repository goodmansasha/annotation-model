const path = require('path'),
  fs = require('fs'),
  pkg = require('../package.json'),
  webpack = require('webpack'),
  ProgressBarPlugin = require('progress-bar-webpack-plugin'),
  resolve = function (dir) {
    return path.join(__dirname, '..', dir)
  }

const config = {
  entry: {
    'annotation-builder': ['./src/index.js']
  },
  output: {
    path: resolve('dist'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.js'],
    modules: [
      resolve('src'),
      resolve('node_modules')
    ]
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'eslint-loader',
        include: resolve('src'),
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: resolve('src')
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: fs.readFileSync(resolve('LICENSE')) + '\n\nBuild hash: [hash]\nVersion: ' + pkg.version + '\n\n'
    }),
    new ProgressBarPlugin({
      format: ' build [:bar] :percent (:elapsed seconds)',
      clear: false
    })
  ],
  target: 'node',
  performance: {
    hints: false
  }
}

module.exports = config
