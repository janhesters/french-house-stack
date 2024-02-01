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
import { Trans } from 'react-i18next';
import type { z } from 'zod';

import { Text, TextLink } from '~/components/text';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
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
import type { RegisterActionData } from '~/features/user-authentication/user-authentication-actions.server';
import { registerAction } from '~/features/user-authentication/user-authentication-actions.server';
import { registrationFormSchema } from '~/features/user-authentication/user-authentication-client-schemas';
import { registerLoader } from '~/features/user-authentication/user-authentication-loaders.server';
import { useEffectOnce } from '~/hooks/use-effect-once';
import { usePromise } from '~/hooks/use-promise';

export const handle = { i18n: 'register' };

export async function loader({ request }: LoaderFunctionArgs) {
  return await registerLoader({ request });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.pageTitle || 'Register' },
];

export async function action({ request }: ActionFunctionArgs) {
  return await registerAction({ request });
}

export default function Register() {
  const { t } = useTranslation('register');
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<RegisterActionData>();
  const form = useForm<z.infer<typeof registrationFormSchema>>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: { acceptedTerms: false, email: '' },
    // @ts-expect-error JsonifyObject causes trouble here.
    errors: actionData?.errors,
  });

  const submit = useSubmit();
  const onSubmit = form.handleSubmit(async data => {
    submit(data, { method: 'post', replace: true });
  });

  const [isRegisteringWithMagic, setIsRegisteringWithMagic] = useState(false);
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
      form.setError('email', { message: 'register:failed-to-load-magic' });
    });
  });

  useEffect(() => {
    if (typeof actionData?.email === 'string' && actionData?.email.length > 0) {
      async function registerWithMagic() {
        try {
          setIsRegisteringWithMagic(true);
          const { magic } = await magicReady;
          const didToken = await magic.auth.loginWithMagicLink({
            email: actionData!.email!,
          });
          if (didToken) {
            submit(
              { didToken, intent: 'magicEmailRegistration' },
              { method: 'post', replace: true },
            );
          } else {
            form.setError('email', { message: 'register:did-token-missing' });
          }
        } catch {
          form.setError('email', { message: 'register:registration-failed' });
        } finally {
          setIsRegisteringWithMagic(false);
        }
      }

      registerWithMagic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData?.email]);

  const navigation = useNavigation();
  const isRegisteringViaEmail =
    navigation.formData?.get('intent') === 'emailRegistration' ||
    navigation.formData?.get('intent') === 'magicEmailRegistration' ||
    isRegisteringWithMagic;

  return (
    <main className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <span className="text-center text-xl font-semibold text-primary">
        {t('common:app-name')}
      </span>

      <TypographyH1 className="mt-2 text-center text-2xl font-semibold lg:text-2xl">
        {t('create-your-account')}
      </TypographyH1>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <FormProvider {...form}>
          <Form method="POST" onSubmit={onSubmit}>
            <fieldset className="space-y-6" disabled={isRegisteringViaEmail}>
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

              <FormField
                control={form.control}
                name="acceptedTerms"
                render={({ field }) => (
                  <FormItem className="items-top flex space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>

                    <div className="grid gap-1 leading-none">
                      <FormLabel>{t('terms-label')}</FormLabel>

                      <FormDescription>
                        <Trans
                          components={{
                            1: (
                              <TextLink
                                target="_blank"
                                rel="noopener noreferrer"
                                to="/terms"
                              />
                            ),
                            2: (
                              <TextLink
                                target="_blank"
                                rel="noopener noreferrer"
                                to="/privacy-policy"
                              />
                            ),
                          }}
                          i18nKey="register:terms-description"
                        />
                      </FormDescription>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button
                {...form.register('intent', { value: 'emailRegistration' })}
                className="w-full"
                type="submit"
              >
                {isRegisteringViaEmail ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    {t('registering')}
                  </>
                ) : (
                  t('register')
                )}
              </Button>
            </fieldset>
          </Form>
        </FormProvider>

        <Text>
          {t('already-a-member')}{' '}
          <TextLink
            to={`/login${loaderData.token ? `?token=${loaderData.token}` : ''}`}
          >
            {t('log-in-to-your-account')}
          </TextLink>
        </Text>
      </div>
    </main>
  );
}
