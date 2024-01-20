import { zodResolver } from '@hookform/resolvers/zod';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import {
  Form,
  useActionData,
  useNavigation,
  useSubmit,
} from '@remix-run/react';
import { Loader2Icon } from 'lucide-react';
import type { FieldErrors } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
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
import { useTranslation } from '~/features/localization/use-translation';
import { onboardingOrganizationAction } from '~/features/onboarding/onboarding-actions.server';
import { onboardingOrganizationSchema } from '~/features/onboarding/onboarding-client-schemas';
import { onboardingOrganizationLoader } from '~/features/onboarding/onboarding-loaders.server';
import { StepsPanelsComponent } from '~/features/onboarding/steps-panels-component';

export const handle = { i18n: 'onboarding-organization' };

export async function loader({ request }: LoaderFunctionArgs) {
  return await onboardingOrganizationLoader({ request });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.pageTitle || 'Onboading Organization' },
];

export async function action({ request }: ActionFunctionArgs) {
  return await onboardingOrganizationAction({ request });
}

export default function OnboardingOrganization() {
  const { t } = useTranslation('onboarding-organization');
  const navigation = useNavigation();
  const isCreatingOrganization =
    navigation.formData?.get('intent') === 'create';

  const actionData = useActionData<{
    errors: FieldErrors<z.infer<typeof onboardingOrganizationSchema>>;
  }>();
  const form = useForm<z.infer<typeof onboardingOrganizationSchema>>({
    resolver: zodResolver(onboardingOrganizationSchema),
    defaultValues: { name: '' },
    // @ts-expect-error JsonifyObject causes trouble here.
    errors: actionData?.errors,
  });
  const submit = useSubmit();
  const onSubmit = form.handleSubmit(data => {
    submit(data, { method: 'POST', replace: true });
  });

  return (
    <>
      <header className="sr-only">
        <h1>{t('onboarding')}</h1>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col space-y-4 py-4 sm:px-6 md:h-full md:space-y-0 md:px-8">
        <div className="px-4 sm:px-0">
          <StepsPanelsComponent
            label={t('onboarding-progress')}
            steps={[
              {
                disabled: true,
                href: '/onboarding/user-profile',
                name: t('user-profile'),
                status: 'complete',
              },
              {
                href: '/onboarding/organization',
                name: t('organization'),
                status: 'current',
              },
            ]}
          />
        </div>

        <div className="flex h-full flex-col py-4">
          <h2 className="sr-only">{t('onboarding-organization')}</h2>

          <Card className="m-auto w-full max-w-md">
            <CardHeader>
              <CardTitle>{t('organization-card-title')}</CardTitle>

              <CardDescription>
                {t('organization-card-description')}
              </CardDescription>
            </CardHeader>

            <FormProvider {...form}>
              <Form method="POST" onSubmit={onSubmit}>
                <fieldset disabled={isCreatingOrganization}>
                  <CardContent>
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
                          </FormDescription>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      {...form.register('intent', { value: 'create' })}
                      type="submit"
                    >
                      {isCreatingOrganization ? (
                        <>
                          <Loader2Icon className="mr-2 size-4 animate-spin" />
                          {t('saving')}
                        </>
                      ) : (
                        <>{t('save')}</>
                      )}
                    </Button>
                  </CardFooter>
                </fieldset>
              </Form>
            </FormProvider>
          </Card>
        </div>
      </main>
    </>
  );
}
