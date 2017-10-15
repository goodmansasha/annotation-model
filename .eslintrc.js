module.exports = {
  env: {
    es6: true,
    node: true,
    mocha: true,
    browser: true
  },
  extends: 'standard',
  rules: {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    'one-var': 0,
    'import/first': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'brace-style': [2, 'stroustrup', { 'allowSingleLine': true }]
  }
}
