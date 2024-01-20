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
import type { FieldErrors } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { Trans } from 'react-i18next';
import type { z } from 'zod';

import { GeneralErrorBoundary } from '~/components/general-error-boundary';
import { Strong, Text } from '~/components/text';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { FormProvider } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import { TypographyH2, TypographyH3 } from '~/components/ui/typography';
import { useTranslation } from '~/features/localization/use-translation';
import { settingsAccountAction } from '~/features/settings/settings-actions.server';
import { settingsAccountSchema } from '~/features/settings/settings-client-schemas';
import { settingsAccountLoader } from '~/features/settings/settings-loaders.server';

export const handle = { i18n: 'settings-account' };

export async function loader({ request, params }: LoaderFunctionArgs) {
  return await settingsAccountLoader({ request, params });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.pageTitle || 'Account' },
];

export async function action({ request, params }: ActionFunctionArgs) {
  return await settingsAccountAction({ request, params });
}

export default function SettingsAccount() {
  const { t } = useTranslation('settings-account');

  const navigation = useNavigation();
  const isDeletingAccount = navigation.formData?.get('intent') === 'delete';

  const { user, usersOwnedOrganizations } = useLoaderData<typeof loader>();
  const isOwner = usersOwnedOrganizations.length > 0;

  const actionData = useActionData<{
    errors: FieldErrors<z.infer<typeof settingsAccountSchema>>;
  }>();
  const form = useForm<z.infer<typeof settingsAccountSchema>>({
    resolver: zodResolver(settingsAccountSchema),
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

      <Dialog>
        <form>
          <fieldset className="space-y-8" disabled={true}>
            <div className="space-y-2">
              <Label htmlFor="read-only-email">{t('email-address')}</Label>

              <Input
                aria-describedby="read-only-email-description"
                autoComplete="email"
                defaultValue={user.email}
                id="read-only-email"
                placeholder={t('email-placeholder')}
                readOnly
                type="email"
              />

              <p
                className="text-[0.8rem] text-muted-foreground"
                id="read-only-email-description"
              >
                {t('email-description')}
              </p>
            </div>

            <div className="space-y-2">
              <TypographyH3 className="mt-0 text-lg font-medium text-destructive">
                {t('delete-account')}
              </TypographyH3>

              {isOwner ? (
                <div className="space-y-1">
                  <Text>
                    <Trans
                      components={{ 1: <Strong /> }}
                      count={usersOwnedOrganizations.length}
                      i18nKey="settings-account:current-owned-organizations"
                      values={{
                        organizations: usersOwnedOrganizations
                          .map(({ name }) => name)
                          .join(', '),
                      }}
                    />
                  </Text>

                  <Text>
                    {t('unlock-deletion-description', {
                      count: usersOwnedOrganizations.length,
                    })}
                  </Text>
                </div>
              ) : (
                <Text>{t('delete-warning')}</Text>
              )}
            </div>
          </fieldset>

          <DialogTrigger asChild>
            <Button className="mt-2" disabled={isOwner} variant="destructive">
              {isDeletingAccount ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  {t('deleting')}
                </>
              ) : (
                <>{t('delete-your-account')}</>
              )}
            </Button>
          </DialogTrigger>
        </form>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialog-title')}</DialogTitle>

            <DialogDescription>{t('dialog-description')}</DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button
                className="mt-2 sm:mt-0"
                disabled={isDeletingAccount}
                type="button"
                variant="secondary"
              >
                {t('cancel')}
              </Button>
            </DialogClose>

            <FormProvider {...form}>
              <Form method="POST" onSubmit={onSubmit}>
                <fieldset disabled={isDeletingAccount}>
                  <Button
                    {...form.register('intent', { value: 'delete' })}
                    className="w-full"
                    type="submit"
                    variant="destructive"
                  >
                    {isDeletingAccount ? (
                      <>
                        <Loader2Icon className="mr-2 size-4 animate-spin" />
                        {t('deleting')}
                      </>
                    ) : (
                      <>{t('delete-your-account')}</>
                    )}
                  </Button>
                </fieldset>
              </Form>
            </FormProvider>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
