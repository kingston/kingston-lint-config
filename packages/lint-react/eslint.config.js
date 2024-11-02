import eslintBase from '@ktam/lint-node/eslint';

export default [
  ...eslintBase,
  {
    rules: {
      // by default, we allow dev dependencies in all root configs
      // but for this repo, we want to make sure we don't have
      // any extraneous dependencies in base configs
      'import-x/no-extraneous-dependencies': [
        'error',
        { devDependencies: ['eslint.config.js', 'prettier.config.js'] },
      ],
    },
  },
];
