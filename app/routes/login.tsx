import { conform, useForm } from '@conform-to/react';
import { parse, refine } from '@conform-to/zod';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useFetcher } from '@remix-run/react';
import type { ActionArgs } from '@remix-run/server-runtime';
import { Magic } from 'magic-sdk';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { badRequest } from 'remix-utils';
import { z } from 'zod';

import { GoogleLogo } from '~/components/google-logo';
import { InputWithError } from '~/components/input-with-error';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { doesUserProfileExistByEmail } from '~/features/user-profile/user-profile-helpers.server';
import { useEffectOnce } from '~/hooks/use-effect-once';
import { usePromise } from '~/hooks/use-promise';

export async function loader({}: LoaderArgs) {
  return json({});
}

function createSchema(
  intent: string,
  constraints: {
    emailExists?: (email: string) => Promise<boolean>;
  } = {},
) {
  return z.discriminatedUnion('intent', [
    z.object({
      intent: z.literal('emailLogin'),
      email: z
        .string()
        .min(1, 'Email is required')
        .email('Email is invalid')
        .superRefine((email, context) =>
          refine(context, {
            validate: () => constraints.emailExists?.(email),
            when: intent === 'submit' || intent === 'validate/email',
            message: 'User not found. Did you mean to create an account?',
          }),
        ),
    }),
    z.object({ intent: z.literal('magicLogin'), didToken: z.string() }),
    z.object({ intent: z.literal('googleLogin') }),
  ]);
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const submission = await parse(formData, {
    schema: intent =>
      createSchema(intent, {
        async emailExists(email) {
          return await doesUserProfileExistByEmail(email);
        },
      }),
    async: true,
  });

  if (!submission.value || submission.intent !== 'submit') {
    return badRequest(submission);
  }

  if (submission.value.intent === 'emailLogin') {
    return json(submission);
  }

  return redirect('/onboarding');
}

export default function Login() {
  const { t } = useTranslation();

  const lastSubmission = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastSubmission,
    onValidate({ formData }) {
      console.log('onValidate', formData);
      return parse(formData, { schema: intent => createSchema(intent) });
    },
    onSubmit(event, { submission }) {
      console.log('onSubmit', submission);
    },
  });

  const fetcher = useFetcher();

  useEffect(() => {
    function submitWithDebounce() {
      setTimeout(() => {
        console.log('submitting');
        // fetcher.submit does NOT trigger the validation ...
        fetcher.submit(
          { intent: 'emailLogin', email: 'bob' },
          {
            method: 'POST',
            replace: true,
          },
        );
      }, 5000);
    }

    submitWithDebounce();
  }, []);

  // const fetcher = useFetcher();
  // const [magicReady, setMagicReady] = usePromise<{ magic: Magic }>();

  // useEffectOnce(() => {
  //   // eslint-disable-next-line unicorn/consistent-function-scoping
  //   async function downloadMagicStaticAssets() {
  //     const magic = new Magic(window.ENV.MAGIC_PUBLISHABLE_KEY, {
  //       /**
  //        * @see https://magic.link/docs/introduction/test-mode
  //        */
  //       testMode: window.runMagicInTestMode,
  //     });

  //     await magic.preload();

  //     setMagicReady({ magic });
  //   }

  //   // magic.preload() can never throw, so we don't need to catch anything.
  //   // See: https://github.com/magiclabs/magic-js/blob/master/packages/@magic-sdk/provider/src/core/view-controller.ts#L195
  //   downloadMagicStaticAssets();
  // });

  // useEffect(() => {
  //   if (lastSubmission?.value?.intent === 'emailLogin') {
  //     const { email } = lastSubmission.value;

  //     async function loginWithMagic() {
  //       try {
  //         const { magic } = await magicReady;
  //         const didToken = await magic.auth.loginWithMagicLink({ email });

  //         if (didToken) {
  //           fetcher.submit(
  //             { intent: 'magicLogin', didToken },
  //             { method: 'POST', replace: true },
  //           );
  //         } else {
  //           // TODO:
  //         }
  //       } catch {
  //         // TODO:
  //       }
  //     }

  //     loginWithMagic();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [lastSubmission?.value?.email]);

  return (
    <main className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <span className="text-center text-xl font-semibold text-primary-text">
        {t('app-name')}
      </span>

      <h1 className="mt-2 text-center text-2xl font-bold leading-9 tracking-tight">
        Log in to your account
      </h1>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <fetcher.Form className="space-y-6" method="POST" {...form.props}>
          <div>
            <Label htmlFor="email">Email</Label>

            <div className="mt-2">
              <InputWithError
                {...conform.input(fields.email)}
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                error={fields.email.error}
                id="email"
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
        </fetcher.Form>

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
