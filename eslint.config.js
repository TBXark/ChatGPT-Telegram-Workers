import globals from "globals";
import pluginJs from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";


export default [
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  jsdoc.configs['flat/recommended'],
  {
    rules: {
      semi : ["error", "always"],
      indent: ["error", 4],
      quotes: ["error", "single"],
      "comma-dangle": ["error", "always-multiline"],
      "no-multi-spaces": "error",
      // "space-before-function-paren": ["error", "always"],
      "object-shorthand": ["error", "always"],
      "operator-linebreak": ["error", "before"],
      "arrow-parens": ["error", "always"],
      "space-infix-ops": "error",
      'jsdoc/no-undefined-types': 'off',
      'jsdoc/require-returns-description': 'off',
      'jsdoc/require-property-description': 'off',
      'jsdoc/require-param-description': 'off',
    },
    plugins: {
      jsdoc
    }
  }
];
