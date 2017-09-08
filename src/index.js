const AnnotationBuilder = require('./annotation-builder').default
if (typeof process !== 'undefined' && typeof process.pid === 'number') {
  module.exports = AnnotationBuilder
}
else {
  global.AnnotationBuilder = AnnotationBuilder
}
