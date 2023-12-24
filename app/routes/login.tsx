import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  redirect,
} from '@remix-run/node';
import { Form, Link, useActionData, useSubmit } from '@remix-run/react';
import { Magic } from 'magic-sdk';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { GoogleLogo } from '~/components/google-logo';
import { InputWithError } from '~/components/input-with-error';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { doesUserProfileExistByEmail } from '~/features/user-profile/user-profile-helpers.server';
import { useEffectOnce } from '~/hooks/use-effect-once';
import { usePromise } from '~/hooks/use-promise';
import { badRequest } from '~/utils/http-responses.server';
import { parseFormData } from '~/utils/parse-form-data.server';

export async function loader({}: LoaderFunctionArgs) {
  return json({});
}

const schema = z.discriminatedUnion('intent', [
  z.object({
    intent: z.literal('emailLogin'),
    email: z.string().min(1, 'Email is required').email('Email is invalid'),
  }),
  z.object({ intent: z.literal('magicEmailLogin'), didToken: z.string() }),
  z.object({ intent: z.literal('magicGoogleLogin') }),
  z.object({ intent: z.literal('magicError'), formError: z.string() }),
]);

type LoginActionData = {
  email?: string;
  errors?: {
    email?: string;
  };
};

export async function action({ request }: ActionFunctionArgs) {
  const data = await parseFormData(schema, request);

  switch (data.intent) {
    case 'emailLogin': {
      const { email } = data;

      const userProfileExists = await doesUserProfileExistByEmail(email);

      if (!userProfileExists) {
        throw badRequest({
          errors: {
            email: `User with email ${email} doesn't exist. Did you mean to create a new account instead?`,
          },
        });
      }

      return json({ email });
    }
    case 'magicEmailLogin': {
      const foo = '';
    }
    case 'magicGoogleLogin': {
      const foo = '';
    }
    case 'magicError': {
      return json({ errors: { form: data.formError } });
    }
  }
}

export default function Login() {
  const { t } = useTranslation();

  const actionData = useActionData<LoginActionData>();

  const [magicReady, setMagicReady] = usePromise<{ magic: Magic }>();
  const submit = useSubmit();

  async function downloadMagicStaticAssets() {
    const magic = new Magic(window.ENV.MAGIC_PUBLISHABLE_KEY, {
      /**
       * @see https://magic.link/docs/introduction/test-mode
       */
      testMode: window.runMagicInTestMode,
    });
    await magic.preload();
    setMagicReady({ magic });
  }

  useEffectOnce(() => {
    downloadMagicStaticAssets().catch(() => {
      // TODO: force user to reload page
      // TODO: report error
      submit(
        {
          intent: 'magicError',
          formError: 'user-authentication:failed-to-load-magic',
        },
        { method: 'post', replace: true },
      );
    });
  });

  useEffect(() => {
    if (typeof actionData?.email === 'string' && actionData?.email.length > 0) {
      async function loginWithMagic() {
        try {
          const { magic } = await magicReady;
          const didToken = await magic.auth.loginWithMagicLink({
            email: actionData!.email!,
          });

          if (didToken) {
            submit(
              { didToken, intent: 'magicEmailLogin' },
              { method: 'post', replace: true },
            );
          } else {
            // TODO: report error
            submit(
              {
                intent: 'magicError',
                formError: 'user-authentication:did-token-missing',
              },
              { method: 'post', replace: true },
            );
          }
        } catch {
          // TODO: reportError
          submit(
            {
              intent: 'magicError',
              formError: 'user-authentication:login-failed',
            },
            { method: 'post', replace: true },
          );
        }
      }

      loginWithMagic();
    }
  }, [actionData, actionData?.email, magicReady, submit]);

  return (
    <main className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <span className="text-center text-xl font-semibold text-primary-text">
        {t('app-name')}
      </span>

      <h1 className="mt-2 text-center text-2xl font-bold leading-9 tracking-tight">
        Log in to your account
      </h1>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <Form className="space-y-6" method="POST">
          <div>
            <Label htmlFor="email">Email</Label>

            <div className="mt-2">
              <InputWithError
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                error={t(actionData?.errors?.email)}
                id="email"
                name="email"
                placeholder="To be done"
                ref={null}
                required
                type="email"
              />
            </div>
          </div>

          <Button
            className="w-full"
            name="intent"
            value="emailLogin"
            type="submit"
          >
            Login
          </Button>
        </Form>

        <div>
          <div className="relative mt-10">
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center"
            >
              <div className="w-full border-t border-border" />
            </div>

            <div className="relative flex justify-center text-sm font-medium leading-6">
              <span className="bg-background px-6 text-foreground">Or</span>
            </div>
          </div>

          <Form className="mt-6" method="POST">
            <Button className="relative inline-flex w-full items-center justify-center gap-3 bg-[#4285F4] hover:bg-[#4285F4]/90 focus-visible:outline-[#4285F4]">
              <GoogleLogo className="absolute left-1 h-7 w-7 rounded bg-white p-0.5" />

              <span>Sign in with Google</span>
            </Button>
          </Form>
        </div>

        <p className="mt-10 text-center text-sm text-gray-400">
          Not a member?{' '}
          <Link
            className="font-semibold leading-6 text-primary-text hover:text-primary-text-hover"
            to="/sign-up"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

// TODO: Split the code into the email form and the google form.
// Use `onSubmit` to programmatically submit the form. OR maybe don't and only
// do the split for TypeScript. But then what about the intents?
// TODO: write new session authentication code with the `Session` model.
// TODO: write custom use translation hook that returns a string or undefined.
// TODO: write E2E tests.
// TODO: write unit tests for the action.

// TODO: Upgrade MSW
// TODO: make sure the user is retrieved by DID after logging in.
