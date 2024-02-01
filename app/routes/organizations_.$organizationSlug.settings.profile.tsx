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
import { TypographyH2, TypographyH3 } from '~/components/ui/typography';
import { useTranslation } from '~/features/localization/use-translation';
import { organizationProfileAction } from '~/features/organizations/organizations-actions.server';
import { organizationProfileSchema } from '~/features/organizations/organizations-client-schemas';
import { ORGANIZATION_MEMBERSHIP_ROLES } from '~/features/organizations/organizations-constants';
import { organizationSettingsProfileLoader } from '~/features/organizations/organizations-loaders.server';

export const handle = { i18n: 'organization-profile' };

export async function loader({ request, params }: LoaderFunctionArgs) {
  return await organizationSettingsProfileLoader({ request, params });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.pageTitle || 'Organization Profile' },
];

export async function action({ request, params }: ActionFunctionArgs) {
  return await organizationProfileAction({ request, params });
}

export default function OrganizationSettingsProfile() {
  const { t } = useTranslation('organization-profile');

  const { currentUsersRole, organization } = useLoaderData<typeof loader>();
  const isAdmin = currentUsersRole === ORGANIZATION_MEMBERSHIP_ROLES.ADMIN;
  const isOwner = currentUsersRole === ORGANIZATION_MEMBERSHIP_ROLES.OWNER;
  const canEdit = isAdmin || isOwner;

  const navigation = useNavigation();
  const isUpdatingOrganization =
    navigation.formData?.get('intent') === 'update';
  const isDeletingOrganization =
    navigation.formData?.get('intent') === 'delete';
  const isSubmitting = navigation.formAction?.includes('settings/profile');

  const actionData = useActionData<{
    errors: FieldErrors<z.infer<typeof organizationProfileSchema>>;
  }>();
  const form = useForm<z.infer<typeof organizationProfileSchema>>({
    resolver: zodResolver(organizationProfileSchema),
    defaultValues: { name: organization?.name },
    // @ts-expect-error JsonifyObject causes trouble here.
    errors: actionData?.errors,
  });

  const submit = useSubmit();
  const onSubmit = form.handleSubmit(data => {
    submit(data, { method: 'POST', replace: true });
  });

  return (
    <main className="mx-auto max-w-xl space-y-6 p-4">
      <div>
        <TypographyH2 className="border-none pb-0 text-lg font-medium">
          {t('title')}
        </TypographyH2>

        <Text className="mt-0">{t('description')}</Text>
      </div>

      <Separator />

      <FormProvider {...form}>
        <Form method="POST" onSubmit={onSubmit}>
          <fieldset className="space-y-8" disabled={!canEdit || isSubmitting}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('organization-name-label')}</FormLabel>

                  <FormControl>
                    <Input
                      autoComplete="organization"
                      placeholder={t('organization-name-placeholder')}
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    {t('organization-name-description')}
                    {canEdit && (
                      <>
                        {' '}
                        <Trans
                          i18nKey="organization-profile:organization-name-change-warning"
                          components={{
                            1: <Strong />,
                          }}
                        />
                      </>
                    )}
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            {canEdit && (
              <Button
                {...form.register('intent', { value: 'update' })}
                type="submit"
              >
                {isUpdatingOrganization ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  <>{t('save')}</>
                )}
              </Button>
            )}
          </fieldset>
        </Form>
      </FormProvider>

      {isOwner && (
        <>
          <Separator />

          <div className="space-y-2 rounded-xl border border-destructive px-4 py-2">
            <TypographyH3 className="mt-0 text-lg font-medium text-destructive">
              {t('danger-zone')}
            </TypographyH3>

            <div className="space-y-1">
              <Text>
                <Strong>{t('delete-this-organization')}</Strong>
                <br />
                {t('deletion-warning')}
              </Text>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="mt-2"
                  disabled={isSubmitting}
                  variant="destructive"
                >
                  {isDeletingOrganization ? (
                    <>
                      <Loader2Icon className="mr-2 size-4 animate-spin" />
                      {t('deleting')}
                    </>
                  ) : (
                    <>{t('delete-this-organization')}</>
                  )}
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('dialog-title')}</DialogTitle>

                  <DialogDescription>
                    {t('dialog-description')}
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter className="sm:justify-end">
                  <DialogClose asChild>
                    <Button
                      className="mt-2 sm:mt-0"
                      disabled={isSubmitting}
                      type="button"
                      variant="secondary"
                    >
                      {t('cancel')}
                    </Button>
                  </DialogClose>

                  <Form method="POST" replace>
                    <fieldset className="w-full" disabled={isSubmitting}>
                      <Button
                        className="w-full"
                        name="intent"
                        type="submit"
                        value="delete"
                        variant="destructive"
                      >
                        {isDeletingOrganization ? (
                          <>
                            <Loader2Icon className="mr-2 size-4 animate-spin" />
                            {t('deleting')}
                          </>
                        ) : (
                          <>{t('delete-this-organization')}</>
                        )}
                      </Button>
                    </fieldset>
                  </Form>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </>
      )}
    </main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
