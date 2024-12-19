// @ts-check

/**
 * @typedef {import('@typescript-eslint/utils/ts-eslint').FlatConfig.ConfigArray} ConfigArray
 * @typedef {import('@ktam/lint-node/eslint-configs/typescript').GenerateTypescriptEslintConfigOptions} GenerateTypescriptEslintConfigOptions
 */

import storybookPlugin from 'eslint-plugin-storybook';
import tsEslint from 'typescript-eslint';

/** @type {GenerateTypescriptEslintConfigOptions} */
export const storybookTypescriptEslintOptions = {
  extraDevDependencies: [
    // allow dev dependencies for Storybook
    '**/*.stories.{js,ts,tsx,jsx}',
    // allow dev dependencies for MDX files
    '**/*.mdx',
  ],
};

/** @type {ConfigArray} */
export const storybookEslintConfig = tsEslint.config(
  // Storybook
  {
    files: ['**/*.stories.{ts,tsx,js,jsx,mjs,cjs}'],
    extends: storybookPlugin.configs['flat/recommended'],
  },

  // Ignores
  {
    ignores: ['storybook-static'],
  },
);

export default storybookEslintConfig;
