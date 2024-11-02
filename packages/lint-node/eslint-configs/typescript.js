// @ts-check

/**
 * @typedef {import('@typescript-eslint/utils/ts-eslint').FlatConfig.ConfigArray} ConfigArray
 */

import eslint from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import * as tsResolver from 'eslint-import-resolver-typescript';
import eslintPluginImportX from 'eslint-plugin-import-x';
import perfectionist from 'eslint-plugin-perfectionist';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import tsEslint from 'typescript-eslint';

/**
 * @typedef {Object} GenerateTypescriptEslintConfigOptions
 * @property {string[]} [extraTsFileGlobs] - Additional file globs to lint with Typescript
 * @property {string[]} [extraDevDependencies] - Additional globs for dev dependencies
 * @property {string[]} [extraDefaultProjectFiles] - Additional default project files
 */

/**
 * Generates a Typescript ESLint configuration
 * @param {GenerateTypescriptEslintConfigOptions[]} [options=[]] - Configuration options
 * @returns {ConfigArray} The generated ESLint configuration
 */
export function generateTypescriptEslintConfig(options = []) {
  const tsFileGlobs = [
    '**/*.{ts,tsx}',
    ...options.flatMap((option) => option.extraTsFileGlobs ?? []),
  ];
  const devDependencies = [
    // allow dev dependencies for test files
    '**/*.test-helper.{js,ts,jsx,tsx}',
    '**/*.test.{js,ts,jsx,tsx}',
    'src/tests/**/*',
    '**/__mocks__/**/*',
    // allow dev dependencies for config files at root level
    '*.{js,ts}',
    '.*.{js,ts}',
    ...options.flatMap((option) => option.extraDevDependencies ?? []),
  ];
  const defaultProjectFiles = [
    'vitest.config.ts',
    ...options.flatMap((option) => option.extraDefaultProjectFiles ?? []),
  ];

  return tsEslint.config(
    // ESLint Configs for all files
    eslint.configs.recommended,
    {
      rules: {
        // disallow console.log since that is typically used for debugging
        'no-console': ['error', { allow: ['warn', 'error', 'debug', 'info'] }],
        // Enforce object shorthand syntax to keep object properties concise.
        'object-shorthand': ['error', 'always'],
        // Enforce the use of template literals instead of string concatenation.
        'prefer-template': 'error',
        // Enforce using concise arrow function syntax when possible.
        'arrow-body-style': ['error', 'as-needed'],
        // Encourage the use of arrow functions for callbacks to avoid `this` binding issues.
        // Allow named functions to be used in arrow functions to support generic functions being passed in
        // e.g. generic components using forwardRef
        'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
        // Disallow renaming imports, exports, or destructured variables to the same name.
        'no-useless-rename': 'error',
      },
    },

    // Typescript ESLint Configs
    {
      files: tsFileGlobs,
      extends: [
        ...tsEslint.configs.strictTypeChecked,
        ...tsEslint.configs.stylisticTypeChecked,
      ],
      languageOptions: {
        parserOptions: {
          projectService: {
            // allow default project for root configs
            allowDefaultProject: defaultProjectFiles,
          },
        },
      },
      rules: {
        // require explicit return types for functions for faster type checking
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          { allowExpressions: true, allowTypedFunctionExpressions: true },
        ],
        // Enforce the use of destructuring for objects where applicable, but not for arrays
        '@typescript-eslint/prefer-destructuring': [
          'error',
          { object: true, array: false },
        ],
        // Ensure consistent usage of type exports
        '@typescript-eslint/consistent-type-exports': 'error',
        // Ensure consistent usage of type imports
        '@typescript-eslint/consistent-type-imports': 'error',
      },
    },

    // Import-X Configs
    eslintPluginImportX.flatConfigs.recommended,
    {
      files: tsFileGlobs,
      extends: [eslintPluginImportX.flatConfigs.typescript],
    },
    {
      rules: {
        // Let Typescript handle it since it slows down linting significantly
        'import-x/namespace': 'off',
        'import-x/default': 'off',

        // Allow named default imports without flagging them as errors
        'import-x/no-named-as-default': 'off',

        // Allow named default members without flagging them as errors
        'import-x/no-named-as-default-member': 'off',

        // Disallow importing dependencies that aren't explicitly listed in the package.json,
        // except for those explicitly allowed under `devDependencies` (e.g., test files)
        'import-x/no-extraneous-dependencies': ['error', { devDependencies }],
      },
      settings: {
        'import-x/resolver': { name: 'tsResolver', resolver: tsResolver },
      },
      languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parserOptions: { ecmaVersion: 2022 },
      },
    },

    // Unicorn Configs
    eslintPluginUnicorn.configs['flat/recommended'],
    {
      rules: {
        // Disable the rule that prevents using abbreviations in identifiers, allowing
        // flexibility in naming, especially for common abbreviations in code.
        'unicorn/prevent-abbreviations': 'off',

        // Disable the rule that disallows `null` values, allowing `null` to be used
        // when necessary (e.g., for nullable types or optional fields).
        'unicorn/no-null': 'off',

        // Allow array callback references without flags, supporting patterns like
        // `array.filter(callbackFunction)`, which can improve readability and code brevity.
        'unicorn/no-array-callback-reference': 'off',
      },
    },

    // Perfectionist Configs
    {
      plugins: { perfectionist },
      rules: {
        // Enforces a consistent sorting order for import statements
        'perfectionist/sort-imports': [
          'error',
          { internalPattern: ['@src/**'] },
        ],
        'perfectionist/sort-exports': ['error'],
        'perfectionist/sort-named-imports': ['error'],
        'perfectionist/sort-named-exports': ['error'],
      },
    },

    // Vitest Configs
    {
      files: ['**/*.test.{ts,js,tsx,jsx}', 'tests/**'],
      plugins: { vitest },
      rules: vitest.configs.recommended.rules,
    },

    // Global Ignores
    { ignores: ['dist', 'node_modules'] },
  );
}
