/* eslint-disable unicorn/prefer-module */
module.exports = function (
  /** @type {import('plop').NodePlopAPI} */
  plop,
) {
  // create your generators here
  plop.setGenerator('basics', {
    description: 'Create any of the basic file types in this repository.',
    prompts: [
      {
        type: 'list',
        name: 'fileType',
        message: 'What do you want to generate?',
        choices: [
          {
            name: 'Database helpers for a model with CRUD operations',
            value: 'dbHelper',
            short: 'DB helper',
          },
          {
            name: 'A React component with tests',
            value: 'reactComponent',
            short: 'React component',
          },
          {
            name: 'E2E tests for a feature',
            value: 'e2eTests',
            short: 'E2E tests',
          },
        ],
      },
      {
        type: 'input',
        name: 'feature',
        message: function ({ fileType }) {
          const ressourceToGenerate =
            fileType === 'dbHelper'
              ? 'those CRUD helpers'
              : fileType === 'reactComponent'
              ? 'the React component'
              : 'the E2E tests';
          return `For what feature do you want to generate ${ressourceToGenerate}?`;
        },
      },
      {
        type: 'input',
        name: 'name',
        message: function ({ fileType }) {
          if (fileType === 'e2eTests') {
            return "What is the url path of the page you want to test? (start with '/')";
          }

          const ressourceToGenerate =
            fileType === 'dbHelper' ? 'the model' : 'the React component';
          return `What is the name of ${ressourceToGenerate}?`;
        },
      },
    ],
    actions: function (data) {
      switch (data.fileType) {
        case 'dbHelper': {
          return [
            {
              type: 'add',
              path: 'app/features/{{kebabCase feature}}/{{kebabCase name}}-model.server.ts',
              templateFile:
                'templates/app/features/feature/feature-model.server.hbs',
            },
          ];
        }
        case 'reactComponent': {
          return [
            {
              type: 'add',
              path: 'app/features/{{kebabCase feature}}/{{kebabCase name}}-component.tsx',
              templateFile:
                'templates/app/features/feature/feature-component.hbs',
            },
            {
              type: 'add',
              path: 'app/features/{{kebabCase feature}}/{{kebabCase name}}-component.test.tsx',
              templateFile:
                'templates/app/features/feature/feature-component.test.hbs',
            },
          ];
        }
        case 'e2eTests': {
          return [
            {
              type: 'add',
              path: 'playwright/e2e/{{kebabCase feature}}/{{kebabCase feature}}.spec.ts',
              templateFile: 'templates/playwright/e2e/feature/feature.spec.hbs',
            },
          ];
        }
        default: {
          throw new Error('Unknown file type', data.fileType);
        }
      }
    },
  });
};
