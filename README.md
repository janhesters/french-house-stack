# Remix French House Stack 🪩

![The Remix French House Stack](./public/french-house-stack.png)

The Remix Stack for Web2, Web3 and
[Web5](https://developer.tbd.website/blog/what-is-web5/) 💃🕺

Learn more about [Remix Stacks](https://remix.run/stacks).

```
npx create-remix --template ten-x-dev/french-house-stack
```

## What's in the Stack? 🤔

The French House Stack is a starter template for SaaS apps in general, but also
for [developing DApps by using Magic](https://magic.link/docs/home#blockchains).
However, Magic is perfectly suited for a regular Web2 app, too.

- Authentication with [Magic](https://magic.link/) and with
  [cookie-based sessions](https://remix.run/docs/en/v1/api/remix#createcookiesessionstorage),
  which enables you to both build Web2 and Web3 apps
- [GitHub Actions](https://github.com/features/actions) for deploy on merge to
  production and staging environments
- Styling with [Tailwind](https://tailwindcss.com/).
  - Includes [dark mode](https://tailwindcss.com/docs/dark-mode).
- Components by [ShadcnUI](https://ui.shadcn.com/) (plus a handful of unique
  custom components.)
- End-to-end testing with [Playwright](https://playwright.dev)
- Unit testing with [Vitest](https://vitest.dev) and
  [Testing Library](https://testing-library.com)
- [MSW](https://mswjs.io/) for mocking API requests in tests and during
  development.
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

- Make sure you're using Node.js 20.10.0 or higher. You can run:

  ```sh
  node -v
  ```

  to check which version you're on.

  If you need to upgrade, we recommend using
  [`nvm`](https://github.com/nvm-sh/nvm):

  ```sh
  nvm install --lts
  nvm use --lts
  nvm alias default 'lts/*'
  ```

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

- Add a `console.warn` to the `'magicEmailRegistration'` case in the
  `registerHandler()` in
  `app/features/user-authentication/user-authentication-actions.server.ts`:

  ```ts
  const { email, issuer: did } =
    await magicAdmin.users.getMetadataByToken(didToken);
  console.warn('did', did);
  ```

- Set up the database:

  ```sh
  npm run prisma:setup
  ```

- Start dev server:

  ```sh
  npm run dev
  ```

- Sign up for an account under `/register` by signing up with Magic.

- Grab the `did` that you logged out in the previous step from the terminal in
  which you ran `npm run dev` and add it to your `.env` file as `SEED_USER_DID`.

- Remove the `console.warn` from the `registerHandler()`.

- Now you can add the remaining values to your `.env` file, which are used by
  the main seed script:

  - `SEED_USER_DID` - The steps above outlined how to get this value. This value
    is the user id of the user that will be seeded in the database. This value
    is required for the `"prisma:seed"` script.
  - `SEED_SEED_USER_EMAIL` - The email of the user that will be seeded in the
    database. This value is required for the `"prisma:seed"` script.
  - `SENTRY_DSN` - The DSN for your Sentry project. This value is optional.

- Lastly, stop your `npm run dev` script and run

  ```sh
  npm run prisma:reset-dev
  ```

  , which wipes the database, seeds the database with lots of data and starts up
  the dev server again.

This starts your app in development mode, rebuilding assets on file changes.

### Dev with Mocks

You can run the app with MSW mocking requests to third party services by
running:

```sh
npm run dev-with-mocks
```

mocking requests from both the client and the server, or

```sh
npm run dev-with-server-mocks
```

mocking only requests from the server.

Make sure you run `npx msw init ./public` once before you run this command to
initialize the MSW service worker. It should create a file in
`/public/mockServiceWorker.js` for you.

This is useful for developing offline or without hitting any API.

By default, MSW is used in the French House Stack to mock requests to Magic in
your E2E tests. Check out `playwright/e2e/user-authentication/logout.spec.ts`
and `app/test/mocks/handlers/magic.ts` to see how to use MSW on the server.

### Prisma helper scripts

- `"prisma:deploy"` - Applies all pending migrations from the
  `prisma/migrations` directory to the database. This is typically used in a
  production environment where you want to apply version-controlled schema
  changes.
- `"prisma:migrate"` - Run via `npm run prisma:migrate -- "my_migration_name"`
  to create a new migration file in the `prisma/migrations` directory based on
  the changes made to your Prisma schema. This command also applies the
  migration to your development database.
- `"prisma:push"` - Applies changes from the Prisma schema to the database
  without creating a migration file. This is useful for quick prototyping and
  development.
- `"prisma:reset-dev"` - Wipes the database, seeds it, and starts the
  development server. This is a utility script that you can use in development
  to get a clean start.
- `"prisma:reset-dev-with-mocks"` - Wipes the database, seeds it, starts the
  development server, and mocks all API requests. This is a utility script that
  you can use in development to get clean starts and to develop offline or
  without hitting any API.
- `"prisma:seed"` - Seeds the database with predefined data. This is useful for
  setting up a consistent state for testing or development.
- `"prisma:setup"` - Generates Prisma Client, applies all pending migrations to
  the database, and then pushes any remaining changes in the Prisma schema that
  are not yet represented by a migration.
- `"prisma:studio"` - Opens Prisma Studio, a visual interface for viewing and
  editing data in your database.
- `"prisma:wipe"` - Wipes the database, deleting all data but keeping the
  schema. This is a utility script that you can use in development to get a
  clean start.

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

The French House Stack uses [Magic](https://magic.link/) for authentication with
a custom session cookie. You can find the implementation in
`app/features/user-authentication`.

Magic keeps track of the user's session in a cookie, but the FHS ignores Magic's
session and uses a session cookie instead. This is because Magic's sessions only
last 2 weeks, while the cookie lasts a year. Additionally, it makes E2E tests
easier because you can fully control the auth flow.

After a user successfully authenticates via Magic, you create a unique session
in your system, tracked by `UserAuthSession`. This session ID is then securely
stored in our session cookie, which we manage using
[Remix's session utils](https://remix.run/docs/en/v1/utils/sessions#using-sessions).
The code for managing these sessions is located in
`app/features/user-authentication/user-authentication-session.server.ts`.

The use of custom auth sessions enables you to to proactively invalidate
sessions is necessary.

If the user is signing up, you also create a user profile for them using their
email, which you can grab from Magic during the sign up flow.

When a user signs out, you delete the `UserAuthSession` and clear the session
cookie.

### ShadcnUI & Custom Components

ShadcnUI is configured in the "New York" setting, but it uses icons from
`lucide-react`, so when generating a component you need to switch out that
import because the "New York" setting usually uses icons from
`@radix-ui/react-icons`. `lucide-react` is used because it has a wider selection
of icons.

In addition to the components from ShadcnUI, the French House Stack comes with
some custom components:

- `app/components/disableable-link.tsx` - A link tag that can be disabled.
- `app/components/drag-and-drop.tsx` - A drag and drop file input component.
- `app/components/general-error-boundary.tsx` - An error boundary component
  inspired by the
  [Epic Stack](https://github.com/epicweb-dev/epic-stack/blob/main/app/components/error-boundary.tsx).
- `app/components/sidebar.tsx` - A sidebar with header and burger menu
  component. It is recommended to configure things like its title using Remix'
  `useMatches` on a per route basis. (See
  `app/features/organizations/organizations-sidebar-component.tsx` for an
  example.)
- `app/components/text.tsx` - Various text components that can be used to render
  text, links and code blocks.

### i18n

The French House Stack comes with localization support through
[remix-i18next](https://github.com/sergiodxa/remix-i18next).

The namespaces live in `public/locales/`.

Remember to add new namespaces to `app/features/localization/i18next.server.ts`
to make them available in the server bundle and to `app/test/i18n.ts` to make
sure they're available in the React component tests.

### Monitoring

The French House Stack comes with error reporting using Sentry build in.

To use it, you need to set the `SENTRY_DSN` environment variable. You can get
this value from your Sentry project.

If you want to configure source maps, look up how to do that in the
[Sentry docs](https://docs.sentry.io/platforms/javascript/guides/remix/sourcemaps/).

### Toasts

The French House Stack includes utilities for toast notifications based on flash
sessions.

**Flash Data:** Temporary session values, ideal for transferring data to the
next request without persisting in the session.

**Redirect with Toast:**

- Utility: `redirectWithToast` (Path: `app/utils/toast.server.ts`)
- Use for redirecting with toast notifications.
- Example:
  ```tsx
  return redirectWithToast(`/organizations/${newOrganizations.slug}/home`, {
    title: 'Organization created',
    description: 'Your organization has been created.',
  });
  ```
- Accepts extra arguments for `ResponseInit` to set headers.

**Direct Toast Headers:**

- Utility: `createToastHeaders` (Path: `app/utils/toast.server.ts`)
- Use for non-redirect scenarios.
- Example:
  ```tsx
  return json(
    { success: true },
    {
      headers: await createToastHeaders({
        description: 'Organization updated',
        type: 'success',
      }),
    },
  );
  ```

**Combining Multiple Headers:**

- Utility: `combineHeaders` (Path: `app/utils/toast.server.tsx`)
- Combine toast headers with additional headers.
- Example:
  ```tsx
  return json(
    { success: true },
    {
      headers: combineHeaders(
        await createToastHeaders({ title: 'Profile updated' }),
        { 'x-foo': 'bar' },
      ),
    },
  );
  ```

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

> **Note:** You might need to run `npx playwright install` to install the
> Playwright browsers before running your tests for the first time.

#### Problems with ShadcnUI

Some of the colors of ShadcnUI's components are lacking the necessary contrast.

You can deactivate those elements in checks like this:

```ts
const accessibilityScanResults = await new AxeBuilder({ page })
  .disableRules('color-contrast')
  .analyze();

// or

const accessibilityScanResults = await new AxeBuilder({ page })
  .disableRules('color-contrast')
  .analyze();
```

or pick a color scheme like "purple" that has good contrast.

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

By default, Vitest runs tests in the
[`"happy-dom"` environment](https://vitest.dev/config/#environment). However,
test files that have `.server` in the name will be run in the `"node"`
environment.

### Test Scripts

- `npm run test` - Runs all Vitest tests.
- `npm run test:unit` - Runs all unit tests with Vitest. Your unit tests should
  test components or function in isolation, run fast, and are files that end
  with `.test.ts` or `.test.tsx`.
- `npm run test:integration` - Runs all integration tests Vitest. Your
  integration tests should test multiple components or functions together, run
  slower than unit tests (e.g. because they hit the database), and are files
  that end with `.spec.ts` or `.spec.tsx`.
- `npm run test:coverage` - Runs all Vitest tests and generates a coverage
  report.
- `npm run test:e2e` - Runs all E2E tests with Playwright.
- `npm run test:e2e:ui` - Runs all E2E tests with Playwright in UI mode.

### Type Checking

This project uses TypeScript. It's recommended to get TypeScript set up for your
editor to get a really great in-editor experience with type checking and
auto-complete. To run type checking across the whole project, run
`npm run type-check`.

### Linting

This project uses ESLint for linting. That is configured in `.eslintrc.cjs`.

### Formatting

We use [Prettier](https://prettier.io/) for auto-formatting in this project.
It's recommended to install an editor plugin (like the
[VSCode Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode))
to get auto-formatting on save. There's also a `npm run format` script you can
run to format all files in the project.

## Next Steps 🚀

### Remove the license

Remember to remove the MIT license and add your own license if you're building a
commercial app.

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

Here is a list of things this app could use:

- feature flags
- user feedback capturing and tracking (you can use Sentry for this).

### [Buidl!](https://www.urbandictionary.com/define.php?term=%23BUIDL)

Now go out there make some magic! 🧙‍♂️
