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