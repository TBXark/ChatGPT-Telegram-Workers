module.exports = {
    'env': {
      'es2021': true,
      'node': true,
    },
    'extends': [
      'google',
    ],
    'parserOptions': {
        'ecmaVersion': 'latest',
        'sourceType': 'module',
    },
    'rules': {
        'max-len': 'off',
    },
    'ignorePatterns': [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
    ],
  };
  