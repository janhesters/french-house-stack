/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */
module.exports = {
  extends: [
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
    'plugin:unicorn/recommended',
    'plugin:import/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['simple-import-sort'],
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/no-array-for-each': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/prevent-abbreviations': [
      'error',
      {
        allowList: {
          e2e: true,
          'remix.env.d': true,
        },
        replacements: {
          props: false,
          ref: false,
          params: false,
        },
      },
    ],
    'unicorn/filename-case': [
      'error',
      {
        case: 'kebabCase',
        ignore: [
          /.*\._index\.tsx$/,
          /.*\$[A-Za-z]+Slug(\.[A-Za-z]+)*\.tsx$/,
          /.*organizations_.*\..+$/,
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        'unicorn/prefer-module': 'off',
      },
    },
    {
      files: ['*.spec.ts'],
      extends: ['plugin:playwright/recommended'],
      rules: {
        'playwright/require-top-level-describe': 'error',
        'unicorn/no-null': 'off',
      },
    },
    {
      files: ['*.test.ts', '*.test.tsx'],
      extends: ['@remix-run/eslint-config/jest-testing-library'],
      settings: {
        jest: {
          version: 27,
        },
      },
      rules: {
        'jest/no-conditional-expect': 'off',
        'unicorn/no-null': 'off',
      },
    },
  ],
};
