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
import { onboardingUserProfileAction } from '~/features/onboarding/onboarding-actions.server';
import { onboardingUserProfileSchema } from '~/features/onboarding/onboarding-client-schemas';
import { onboardingUserProfileLoader } from '~/features/onboarding/onboarding-loaders.server';
import { StepsPanelsComponent } from '~/features/onboarding/steps-panels-component';

export const handle = { i18n: 'onboarding-user-profile' };

export async function loader({ request }: LoaderFunctionArgs) {
  return await onboardingUserProfileLoader({ request });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.pageTitle || 'Onboading User Profile' },
];

export async function action({ request }: ActionFunctionArgs) {
  return await onboardingUserProfileAction({ request });
}

export default function OnboardingUserProfile() {
  const { t } = useTranslation('onboarding-user-profile');
  const navigation = useNavigation();
  const isCreatingUserProfile = navigation.formData?.get('intent') === 'create';

  const actionData = useActionData<{
    errors: FieldErrors<z.infer<typeof onboardingUserProfileSchema>>;
  }>();
  const form = useForm<z.infer<typeof onboardingUserProfileSchema>>({
    resolver: zodResolver(onboardingUserProfileSchema),
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
                name: t('user-profile'),
                href: '/onboarding/user-profile',
                status: 'current',
              },
              {
                name: t('organization'),
                href: '/onboarding/organization',
                status: 'upcoming',
                disabled: true,
              },
            ]}
          />
        </div>

        <div className="flex h-full flex-col py-4">
          <h2 className="sr-only">{t('onboarding-user-profile')}</h2>

          <Card className="m-auto w-full max-w-md">
            <CardHeader>
              <CardTitle>{t('profile-card-title')}</CardTitle>

              <CardDescription>{t('profile-card-description')}</CardDescription>
            </CardHeader>

            <FormProvider {...form}>
              <Form method="POST" onSubmit={onSubmit}>
                <fieldset disabled={isCreatingUserProfile}>
                  <CardContent>
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
                  </CardContent>

                  <CardFooter>
                    <Button
                      {...form.register('intent', { value: 'create' })}
                      className="w-full"
                      type="submit"
                    >
                      {isCreatingUserProfile ? (
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
