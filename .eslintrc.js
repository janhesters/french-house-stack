/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */
// eslint-disable-next-line unicorn/prefer-module
module.exports = {
  extends: [
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
    'plugin:unicorn/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['simple-import-sort'],
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'unicorn/prefer-node-protocol': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/prevent-abbreviations': [
      'error',
      {
        allowList: {
          e2e: true,
          props: true,
          'remix.env.d': true,
        },
      },
    ],
  },
  overrides: [
    {
      files: ['*.cy.ts'],
      extends: ['plugin:cypress/recommended'],
    },
    {
      files: ['*.test.ts', '*.test.tsx'],
      extends: ['@remix-run/eslint-config/jest-testing-library'],
    },
  ],
};
