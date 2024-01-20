import { zodResolver } from '@hookform/resolvers/zod';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from '@remix-run/react';
import { Loader2Icon } from 'lucide-react';
import type { FieldErrors } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import type { ActionFunctionArgs } from 'react-router';
import type { z } from 'zod';

import { GeneralErrorBoundary } from '~/components/general-error-boundary';
import { Text } from '~/components/text';
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
import { Separator } from '~/components/ui/separator';
import { TypographyH2 } from '~/components/ui/typography';
import { useTranslation } from '~/features/localization/use-translation';
import { settingsUserProfileAction } from '~/features/settings/settings-actions.server';
import { settingsUserProfileSchema } from '~/features/settings/settings-client-schemas';
import { settingsUserProfileLoader } from '~/features/settings/settings-loaders.server';

export const handle = { i18n: 'settings-user-profile' };

export function loader({ request, params }: LoaderFunctionArgs) {
  return settingsUserProfileLoader({ request, params });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.pageTitle || 'Profile' },
];

export function action({ request, params }: ActionFunctionArgs) {
  return settingsUserProfileAction({ request, params });
}

export default function SettingsProfile() {
  const { t } = useTranslation('settings-user-profile');

  const navigation = useNavigation();
  const isUpdatingUserProfile = navigation.formData?.get('intent') === 'update';

  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<{
    errors: FieldErrors<z.infer<typeof settingsUserProfileSchema>>;
  }>();
  const form = useForm<z.infer<typeof settingsUserProfileSchema>>({
    resolver: zodResolver(settingsUserProfileSchema),
    defaultValues: { name: user.name },
    // @ts-expect-error JsonifyObject causes trouble here.
    errors: actionData?.errors,
  });

  const submit = useSubmit();
  const onSubmit = form.handleSubmit(data => {
    submit(data, { method: 'POST', replace: true });
  });

  return (
    <main className="mx-auto w-full max-w-xl space-y-6 px-4 pb-8 pt-[8.5rem]">
      <div>
        <TypographyH2 className="border-none pb-0 text-lg font-medium">
          {t('title')}
        </TypographyH2>

        <Text className="mt-0">{t('description')}</Text>
      </div>

      <Separator />

      <FormProvider {...form}>
        <Form method="POST" onSubmit={onSubmit}>
          <fieldset className="space-y-8" disabled={isUpdatingUserProfile}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('user-name-label')}</FormLabel>

                  <FormControl>
                    <Input
                      autoComplete="name"
                      placeholder={t('user-name-placeholder')}
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    {t('user-name-description')}
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              {...form.register('intent', { value: 'update' })}
              type="submit"
            >
              {isUpdatingUserProfile ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                <>{t('save')}</>
              )}
            </Button>
          </fieldset>
        </Form>
      </FormProvider>
    </main>
  );
}

export function ErrorBoundary() {
  return (
    <div className="h-full pt-[6.5rem]">
      <GeneralErrorBoundary />
    </div>
  );
}
