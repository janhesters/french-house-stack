import { zodResolver } from '@hookform/resolvers/zod';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import {
  Form,
  useLoaderData,
  useNavigation,
  useSubmit,
} from '@remix-run/react';
import { Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import {
  Header,
  HeaderBackButton,
  HeaderSeperator,
  HeaderTitle,
  HeaderUserProfileDropdown,
} from '~/components/header';
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
import { newOrganizationAction } from '~/features/organizations/organizations-actions.server';
import { newOrganizationSchema } from '~/features/organizations/organizations-client-schemas';
import { newOrganizationLoader } from '~/features/organizations/organizations-loaders.server';

export const handle = { i18n: ['organizations-new', 'header'] };

export async function loader({ request, params }: LoaderFunctionArgs) {
  return await newOrganizationLoader({ request, params });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.pageTitle || 'New Organization' },
];

export function action({ request, params }: ActionFunctionArgs) {
  return newOrganizationAction({ request, params });
}

export default function OrganizationsNew() {
  const { t } = useTranslation('organizations-new');
  const { userNavigation } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isCreatingOrganization =
    navigation.formData?.get('intent') === 'create';

  const form = useForm<z.infer<typeof newOrganizationSchema>>({
    resolver: zodResolver(newOrganizationSchema),
    defaultValues: { name: '' },
  });
  const submit = useSubmit();
  const onSubmit = form.handleSubmit(data => {
    submit(data, { method: 'POST', replace: true });
  });

  return (
    <div className="flex h-full flex-col">
      <Header>
        <HeaderBackButton />

        <HeaderSeperator className="lg:hidden" />

        <HeaderTitle>{t('organizations')}</HeaderTitle>

        <HeaderSeperator className="hidden lg:block" />

        <HeaderUserProfileDropdown {...userNavigation} />
      </Header>

      <main className="mx-auto flex h-full w-full max-w-7xl flex-col sm:px-6 md:px-8">
        <h2 className="sr-only">{t('create-new-organization')}</h2>

        <div className="flex h-full flex-col p-2">
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
    </div>
  );
}
