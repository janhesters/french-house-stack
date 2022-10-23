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
    '@remix-run/eslint-config/jest-testing-library',
  ],
  plugins: ['simple-import-sort'],
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    // Allow file namings like `$slug.tsx`.
    'unicorn/filename-case': [
      'error',
      {
        case: 'kebabCase',
        ignore: [/\$[A-Za-z]+\.tsx/],
      },
    ],
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/no-array-for-each': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/prefer-node-protocol': 'off',
    'unicorn/prevent-abbreviations': [
      'error',
      {
        allowList: {
          e2e: true,
          'remix.env.d': true,
        },
        replacements: {
          props: false,
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
      settings: {
        jest: {
          version: 27,
        },
      },
    },
  ],
};
