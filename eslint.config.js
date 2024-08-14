import antfu from '@antfu/eslint-config'
import { jsdoc, imports, javascript } from '@antfu/eslint-config'


export default antfu(
  {
    type: 'app',
    stylistic: {
      indent: 4,
      quotes: 'single',
      semi: true,
      braceStyle: '1tbs',
    },
    markdown: false,
    ignores: [
      '.github/**',
    ],
  },
  jsdoc, imports, javascript,
  {
    rules: {
      'jsdoc/no-undefined-types': 'off',
      'jsdoc/require-returns-description': 'off',
      'jsdoc/require-property-description': 'off',
      'jsdoc/require-param-description': 'off',
      'node/prefer-global/process': 'off',
      'node/prefer-global/buffer': 'off',
      'eslint-comments/no-unlimited-disable': 'off',
      'padding-line-between-statements': 'off',
      'no-console': 'off',
      "style/brace-style": ["error", "1tbs", { allowSingleLine: true }],
    }
  }
)
