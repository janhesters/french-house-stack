# Remix French House Stack 🪩

![The Remix French House Stack](./public/french-house-stack.png)

The Remix Stack for Web2, Web3 and
[Web5](https://developer.tbd.website/blog/what-is-web5/) 💃🕺

Learn more about [Remix Stacks](https://remix.run/stacks).

```
npx create-remix --template janhesters/french-house-stack
```

## What's in the Stack? 🤔

The French House Stack is a starter template for
[developing DApps by using Magic](https://magic.link/docs/home#blockchains).
However, Magic is perfectly suited for a regular Web2 app, too.

- Authentication with [Magic](https://magic.link/) and with
  [cookie-based sessions](https://remix.run/docs/en/v1/api/remix#createcookiesessionstorage),
  which enables you to both build Web2 and Web3 apps
- [GitHub Actions](https://github.com/features/actions) for deploy on merge to
  production and staging environments
- Styling with [Tailwind](https://tailwindcss.com/).
  - Includes [dark mode](https://tailwindcss.com/docs/dark-mode).
  - The routes in this app have been build using the
    [free components from Tailwind UI](https://tailwindui.com/preview)
- End-to-end testing with [Playwright](https://playwright.dev)
- Unit testing with [Vitest](https://vitest.dev) and
  [Testing Library](https://testing-library.com)
- [SQLite](https://www.sqlite.org/index.html) database with
  [Prisma](https://www.prisma.io/) as the ORM
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

## Development 🛠

### Getting Started

- Make sure you're using Node.js 16.0.0 or higher. You can run:

  ```sh
  node -v
  ```

  to check which version you're on.

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
    public key and a secret key for your project from your
    [Magic dashboard](https://magic.link).
  - `SESSION_SECRET` - The session secret can be any string that is at least 32
    characters long.
  - `DATABASE_URL` - The url under which the SQLite database will operate. You
    may use the value from `.env.example` for this.

- Add a `console.warn` to `getUserIdFromSession()` in
  `app/features/user-authentication/user-authentication-session.server.ts`:

  ```ts
  const getUserIdFromSession = (session: Session): string | undefined => {
    const userId = session.get(USER_SESSION_KEY);
    console.warn('userId', userId);
    return userId;
  };
  ```

- Set up the database:

  ```sh
  npm run prisma:setup
  ```

- Start dev server:

  ```sh
  npm run dev
  ```

- Sign up for an account under `/login` by logging in with Magic.

- Grab the `userId` that you logged out in the previous step from the terminal
  in which you ran `npm run dev` and add it to your `.env` file as
  `SEED_USER_ID`.

- Remove the `console.warn` from `getUserIdFromSession()`.

- Now you can add the remaining values to your `.env` file, which are used by
  the main seed script:

  - `SEED_USER_ID` - The steps above outlined how to get this value. This value
    is the user id of the user that will be seeded in the database. This value
    is required for the `"prisma:seed"` script.

- Lastly, stop your `npm run dev` script and run

  ```sh
  npm run prisma:reset-dev
  ```

  , which wipes the database, seeds the database with lots of data and starts up
  the dev server again.

This starts your app in development mode, rebuilding assets on file changes.

### Prisma helper scripts

- `"prisma:apply-changes"` - Applies changes to the database schema to the
  database.
- `"prisma:seed"` - Seeds the database with a user profile.
- `"prisma:setup"` - Sets up the database.
- `"prisma:wipe"` - Wipes the database (irrevocably delete all data, but keep
  the schema).
- `"prisma:reset-dev"` - Wipes the database, seeds it and starts the dev server.
  This is a utility script that you can use in development to get clean starts.

### Generating boilerplate

This repository uses [Plop](https://plopjs.com/documentation/#getting-started)
to automate the generation of common boilerplate.

Run `npm run gen` and then choose what you want to create, e.g.:

```
$ npm run gen

> gen
> plop

? What do you want to generate? React component
? For what feature do you want to generate the React component? user profile
? What is the name of the React component? user name
✔  ++ /app/features/user-profile/user-name-component.tsx
✔  ++ /app/features/user-profile/user-name-component.test.tsx
```

Out of the box, there are three options:

- React component with unit test
- Database model utils
- E2E tests for a route

### Routing

We're using flat routes, a feature which will
[ship natively with Remix, soon](https://github.com/remix-run/remix/issues/4483).

You can
[check out this video for an in-depth explanation](https://portal.gitnation.org/contents/remix-flat-routes-an-evolution-in-routing).

### How authentication works 🛡️

We use [Magic](https://magic.link/) for authentication with a custom session
cookie. You can find the implementation in `app/features/user-authentication`.

Magic keeps track of the user's session in a cookie, but we ignore Magic's
session and use our own session cookie instead. This is because Magic's sessions
only last 2 weeks, while our lasts a year. Additionally, it makes E2E tests
easier because we fully control the auth flow.

We use
[Remix's session utils](https://remix.run/docs/en/v1/utils/sessions#using-sessions)
to manage the session cookie. The code for this lives in
`app/features/user-authentication/user-authentication-session.server.ts`.

When a user signs in or up using Magic, we grab the user id (the one you logged
out during the getting started section) and store it in the session cookie.

If the user is signing up, we also create a user profile for them using their
email, which we can grab from Magic during the sign up flow.

When a user signs out, we clear the session cookie.

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

## Testing 🧪

### Playwright 🎭

> **Note:** make sure you've run `npm run dev` at least one time before you run
> the E2E tests!

We use Playwright for our End-to-End tests in this project. You'll find those in
the `playwright/` directory. As you make changes to your app, add to an existing
file or create a new file in the `playwright/e2e` directory to test your
changes.

[Playwright natively features testing library selectors](https://playwright.dev/docs/release-notes#locators)
for selecting elements on the page semantically.

To run these tests in development, run `npm run test:e2e` which will start the
dev server for the app as well as the Playwright client.

#### VSCode Extension

If you're using VSCode, you can install the
[Playwright extension](https://github.com/microsoft/playwright-vscode) for a
better developer experience.

#### Utilities

We have a utility for testing authenticated features without having to go
through the login flow:

```ts
test('something that requires an authenticated user', async ({ page }) => {
  await loginByCookie({ page });
  // ... your tests ...
});
```

Check out the `playwright/utils.ts` file for other utility functions.

#### Miscellaneous

To mark a test as todo in Playwright,
[you have to use `.fixme()`](https://github.com/microsoft/playwright/issues/10918).

```ts
test('something that should be done later', ({}, testInfo) => {
  testInfo.fixme();
});

test.fixme('something that should be done later', async ({ page }) => {
  // ...
});

test('something that should be done later', ({ page }) => {
  test.fixme();
  // ...
});
```

The version using `testInfo.fixme()` is the "preferred" way and can be picked up
by the VSCode extension.

### Vitest ⚡️

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

## Next Steps 🚀

### Pick a Database

The French House Stack comes with a SQLite database out of the box. It uses
[Prisma](https://www.prisma.io/) to abstract away the database layer, so you can
easily switch it out for another database.

If you're looking for inspiration for a centralized database, check out the
[Blues Stack](https://github.com/remix-run/blues-stack) for a enterprise grade
PostgeSQL setup.

If you build a DApp, you might want to use the [IPFS](https://ipfs.io/) or
something like [3Box](https://3boxlabs.com/).

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

The French House Stack comes with a magic link setup via email preconfigured.
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

Now go out there make some magic! 🧙‍♂️

[Ask better questions! 📈](https://janhesters.com)
