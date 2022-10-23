# Remix French House Stack

![The Remix French House Stack](./public/french-house-stack.png)

Learn more about [Remix Stacks](https://remix.run/stacks).

```
npx create-remix --template janhesters/french-house-stack
```

## What's in the Stack?

The French House Stack is a starter template for
[developing DApps by using Magic](https://magic.link/docs/home#blockchains).
However, Magic is perfectly suited for a regular Web2 app, too.

- Authentication with [Magic](https://magic.link/) and with
  [cookie-based sessions](https://remix.run/docs/en/v1/api/remix#createcookiesessionstorage),
  which enables you to both build Web2 and Web3 apps
- [GitHub Actions](https://github.com/features/actions) for deploy on merge to
  production and staging environments
- Styling with [Tailwind](https://tailwindcss.com/) and the routes in this app
  have been build using the
  [free components from Tailwind UI](https://tailwindui.com/preview)
- End-to-end testing with [Cypress](https://cypress.io)
- Unit testing with [Vitest](https://vitest.dev) and
  [Testing Library](https://testing-library.com)
- Code formatting with [Prettier](https://prettier.io)
- Linting with [ESLint](https://eslint.org)
- Static Types with [TypeScript](https://typescriptlang.org)
- Commit hooks with [Husky](https://github.com/typicode/husky) and
  [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) with
  [Commitizen](https://github.com/commitizen/cz-cli)

### Versioning

This stack pinned all version of its dependencies in order to ensure that it
always works. You can use

```
npx npm-check-updates -u
```

to check for updates and install the latest versions.

## Development

- Install dependencies:

  ```sh
  npm i
  ```

- Make sure your system can run the Husky hooks (Mac & Linux):

  ```sh
  chmod a+x .husky/pre-commit
  chmod a+x .husky/commit-msg
  ```

- Create a `.env` file and add these environment variables (see `.env.example`,
  too):

  - `MAGIC_PUBLISHABLE_KEY` and `MAGIC_SECRET_KEY` - You'll need to grab a
    public key and a secret key for your project from your Magic dashboard.
  - `SESSION_SECRET` - The session secret can be any string that is at least 32
    characters long.
  - `VALID_COOKIE_TOKEN` - You'll need to generate a valid cookie token for your
    E2E by running the app, logging in, and grabbing it from your network tab.
    It should be the value saved as `'__user-authentication-session'`.

- Start dev server:

  ```sh
  npm run dev
  ```

This starts your app in development mode, rebuilding assets on file changes.

#### Generating boilerplate

This repository uses [Plop](https://plopjs.com/documentation/#getting-started)
to automate the generation of common boilerplate.

Run `npm run gen` and then choose what you want to create, e.g.:

```
$ npm run gen

> gen
> plop

? What do you want to generate? React component
? For what feature do you want to generate the React component? user-profile
? What is the name of the React component? user name
✔  ++ /app/features/user-profile/user-name-component.tsx
✔  ++ /app/features/user-profile/user-name-component.test.tsx
```

### i18n

The French House Stack comes with localization support through
[remix-i18next](https://github.com/sergiodxa/remix-i18next).

The namespaces live in `public/locales/`.

## GitHub Actions

We use GitHub Actions for pull request checks. Any pull request triggers checks
such as linting, type checks, unit tests and E2E tests.

Check out the
[Remix team's official stacks](https://remix.run/docs/en/v1/pages/stacks) to
learn how to use GitHub Actions for continuous integration and deployment.

## Testing

### Cypress

We use Cypress for our End-to-End tests in this project. You'll find those in
the `cypress` directory. As you make changes, add to an existing file or create
a new file in the `cypress/e2e` directory to test your changes.

We use [`@testing-library/cypress`](https://testing-library.com/cypress) for
selecting elements on the page semantically.

To run these tests in development, run `npm run test:e2e:dev` which will start
the dev server for the app as well as the Cypress client. Make sure the database
is running in docker as described above.

We have a utility for testing authenticated features without having to go
through the login flow:

```ts
cy.loginByCookie();
```

### Vitest

For lower level tests of utilities and individual components, we use `vitest`.
We have DOM-specific assertion helpers via
[`@testing-library/jest-dom`](https://testing-library.com/jest-dom).

### Type Checking

This project uses TypeScript. It's recommended to get TypeScript set up for your
editor to get a really great in-editor experience with type checking and
auto-complete. To run type checking across the whole project, run
`npm run type-check`.

### Linting

This project uses ESLint for linting. That is configured in `.eslintrc.js`.

### Formatting

We use [Prettier](https://prettier.io/) for auto-formatting in this project.
It's recommended to install an editor plugin (like the
[VSCode Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode))
to get auto-formatting on save. There's also a `npm run format` script you can
run to format all files in the project.

## Next Steps

### Pick a Database

The French House stack intentionally leaves out a database setup for you because
if you build a DApp you might want to use the [IPFS](https://ipfs.io/) or
something like [3Box](https://3boxlabs.com/). And if you build a Web2 app, you
might want to go with a traditional database.

If you're looking for inspiration for a centralized database, check out the
[Indie Stack](https://github.com/remix-run/indie-stack) for a simple SQLite
setup or the [Blues Stack](https://github.com/remix-run/blues-stack) for a
enterprise grade PostgeSQL setup.

### Pick a Blockchain

Magic is compatible with a
[variety of blockchains](https://magic.link/docs/home#blockchains). The most
popular for DApps is
[Ethereum](https://magic.link/docs/advanced/blockchains/ethereum/javascript) and
the most popular chain in general is
[Bitcoin](https://magic.link/docs/advanced/blockchains/bitcoin).

### Deployment

Learn how you can
[deploy your Remix app here](https://remix.run/docs/en/v1/guides/deployment).
For examples of setups you can check out the
[official Remix stacks](https://remix.run/docs/en/v1/pages/stacks).

### Explore Magic

The French House Stack comes with magic link setup via email preconfigured.
However, Magic also offers social auth (e.g. for
[Google](https://magic.link/docs/login-methods/social-logins/integration/social-providers/google)),
[multi-factor auth](https://magic.link/docs/login-methods/mfa) and
[WebAuthn](https://magic.link/docs/login-methods/webauthn).

**Note:** the included cookie based authentication with
`createCookieSessionStorage` is set up
[as recommended by the Magic docs](https://magic.link/docs/introduction/faq#sessions-and-tokens).
However, it doesn't work for Web3 functions. You'll need to
[stay logged in with Magic](https://magic.link/docs/introduction/faq#how-long-does-a-user-remain-logged-in)
to work with any chain.

### To-Dos

There are a bunch of TODOs in the code, for example for error reporting. This
stack leaves it to you to handle error reporting.

Here is a list of things this app could use:

- error reporting
- feature flags
- use feedback capturing and tracking

### [Buidl!](https://www.urbandictionary.com/define.php?term=%23BUIDL)

Now go out there make some magic, and ask better questions!
