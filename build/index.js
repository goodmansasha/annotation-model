const webpack = require('webpack'),
  webpackConfig = require('./webpack.conf')

webpack(webpackConfig, function (err, stats) {
  if (err) {
    process.stderr.write(`${err.message}\n\n${err.stack}\n\n`)
    return process.exit(err.code)
  }
  const ststr = stats ? stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) : stats
  if (ststr) {
    process.stdout.write(`${ststr}\n\n`)
  }
  process.exit(0)
})
