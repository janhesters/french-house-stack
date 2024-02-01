import { zodResolver } from '@hookform/resolvers/zod';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from '@remix-run/react';
import { Loader2Icon } from 'lucide-react';
import { Magic } from 'magic-sdk';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { Text, TextLink } from '~/components/text';
import { Button } from '~/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { TypographyH1 } from '~/components/ui/typography';
import { useTranslation } from '~/features/localization/use-translation';
import type { LoginActionData } from '~/features/user-authentication/user-authentication-actions.server';
import { loginAction } from '~/features/user-authentication/user-authentication-actions.server';
import { loginFormSchema } from '~/features/user-authentication/user-authentication-client-schemas';
import { loginLoader } from '~/features/user-authentication/user-authentication-loaders.server';
import { useEffectOnce } from '~/hooks/use-effect-once';
import { usePromise } from '~/hooks/use-promise';

export const handle = { i18n: 'login' };

export async function loader({ request }: LoaderFunctionArgs) {
  return await loginLoader({ request });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.pageTitle || 'Login' },
];

export async function action({ request }: ActionFunctionArgs) {
  return await loginAction({ request });
}

export default function Login() {
  const { t } = useTranslation('login');
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<LoginActionData>();
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '' },
    // @ts-expect-error JsonifyObject causes trouble here.
    errors: actionData?.errors,
  });

  const submit = useSubmit();
  const onSubmit = form.handleSubmit(data => {
    submit(data, { method: 'post', replace: true });
  });

  const [isLoggingInWithMagic, setIsLoggingInWithMagic] = useState(false);
  const [magicReady, setMagicReady] = usePromise<{ magic: Magic }>();

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
      form.setError('email', { message: t('failed-to-load-magic') });
    });
  });

  useEffect(() => {
    if (typeof actionData?.email === 'string' && actionData?.email.length > 0) {
      async function loginWithMagic() {
        try {
          setIsLoggingInWithMagic(true);
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
            form.setError('email', { message: t('did-token-missing') });
          }
        } catch {
          form.setError('email', { message: t('login-failed') });
        } finally {
          setIsLoggingInWithMagic(false);
        }
      }

      loginWithMagic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData?.email]);

  const navigation = useNavigation();
  const isLoggingInViaEmail =
    navigation.formData?.get('intent') === 'emailLogin' ||
    navigation.formData?.get('intent') === 'magicEmailLogin' ||
    isLoggingInWithMagic;

  return (
    <main className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <span className="text-center text-xl font-semibold text-primary">
        {t('common:app-name')}
      </span>

      <TypographyH1 className="mt-2 text-center text-2xl font-semibold lg:text-2xl">
        {t('log-in-to-your-account')}
      </TypographyH1>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <FormProvider {...form}>
          <Form method="POST" onSubmit={onSubmit}>
            <fieldset className="space-y-6" disabled={isLoggingInViaEmail}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email-address')}</FormLabel>

                    <FormControl>
                      <Input placeholder={t('email-placeholder')} {...field} />
                    </FormControl>

                    <FormDescription className="sr-only">
                      {t('email-description')}
                    </FormDescription>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                {...form.register('intent', { value: 'emailLogin' })}
                className="w-full"
                type="submit"
              >
                {isLoggingInViaEmail ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    {t('authenticating')}
                  </>
                ) : (
                  t('login')
                )}
              </Button>
            </fieldset>
          </Form>
        </FormProvider>

        <Text>
          {t('not-a-member')}{' '}
          <TextLink
            to={`/register${loaderData.token ? `?token=${loaderData.token}` : ''}`}
          >
            {t('create-your-account')}
          </TextLink>
        </Text>
      </div>
    </main>
  );
}
