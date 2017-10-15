const webpack = require('webpack'),
  configBase = require('./webpack.base.conf'),
  configDist = require('./webpack.dist.conf')

const build = function (config) {
  return new Promise(function (resolve, reject) {
    webpack(config, function (err, stats) {
      if (err) return reject(err)
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
      resolve()
    })
  })
}

build(configBase)
  .then(function () { return build(configDist) })
  .then(function () { process.exit(0) })
  .catch(function (err) {
    process.stderr.write(`${err.message}\n\n${err.stack}\n\n`)
    process.exit(err.code)
  })
