module.exports = {
  env: {
    browser: false,
    es2021: true,
    mocha: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    semi: ['error', 'never'],
    quotes: [
      'error',
      'single',
      {avoidEscape: true, allowTemplateLiterals: false},
    ],
  },
}
