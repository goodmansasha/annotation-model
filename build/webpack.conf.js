const path = require('path'),
  fs = require('fs'),
  pkg = require('../package.json'),
  webpack = require('webpack'),
  UglifyEsPlugin = require('uglify-es-webpack-plugin'),
  resolve = function (dir) {
    return path.join(__dirname, '..', dir)
  }

const config = {
  entry: {
    'annotation-builder': ['./src/index.js']
  },
  output: {
    path: resolve('dist'),
    filename: '[name].min.js'
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
      { // eslint
        enforce: 'pre',
        test: /\.(js)$/,
        loader: 'eslint-loader',
        include: resolve('src/'),
        exclude: /node_modules/,
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: resolve('src/'),
        exclude: /node_modules/
      }
    ]
  },
  devtool: '#source-map',
  plugins: [
    new UglifyEsPlugin({
      sourceMap: true,
      minimize: true,
      compress: {
        warnings: true
      }
    }),
    new webpack.BannerPlugin({
      banner: fs.readFileSync(resolve('LICENSE')) + '\n\n' +
        'Version: ' + pkg.version + 'Build Date: ' + new Date() + 'Build hash: [hash]\n\n'
    })
  ],
  externals: [
    {
      crypto: true
    }
  ],
  node: {
    process: false,
    require: false
  },
  performance: {
    hints: false
  }
}

module.exports = config
