module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'google'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'object-curly-spacing': ['error', 'always'],
    'require-jsdoc': 'off',
    'max-len': 'off',
    'operator-linebreak': ['error', 'before'],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
  },
};
