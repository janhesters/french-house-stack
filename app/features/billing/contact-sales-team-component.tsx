import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  useActionData,
  useNavigation,
  useSubmit,
} from '@remix-run/react';
import { Loader2Icon } from 'lucide-react';
import type { FieldErrors } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { HoneypotInputs } from 'remix-utils/honeypot/react';
import type { z } from 'zod';

import { Text } from '~/components/text';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';

import { contactSalesFormSchema } from './billing-client-schemas';

export type ContactSalesTeamComponentProps = {};

export function ContactSalesTeamComponent(
  props: ContactSalesTeamComponentProps,
) {
  const { t } = useTranslation('contact-sales');
  const navigation = useNavigation();
  const isContactingSales =
    navigation.formData?.get('intent') === 'contactSales';

  const actionData = useActionData<{
    errors: FieldErrors<z.infer<typeof contactSalesFormSchema>>;
  }>();
  const form = useForm<z.infer<typeof contactSalesFormSchema>>({
    resolver: zodResolver(contactSalesFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      companyName: '',
      workEmail: '',
      phoneNumber: '',
      message: '',
    },
    // @ts-expect-error JsonifyObject causes trouble here.
    errors: actionData?.errors,
  });

  const submit = useSubmit();
  const onSubmit = form.handleSubmit(data => {
    submit(data, { method: 'post', replace: true });
  });

  return (
    <Card>
      <CardHeader className="space-y-6">
        <CardTitle className="text-5xl text-primary">
          {t('contact-sales-title')}
        </CardTitle>

        <CardDescription className="text-2xl">
          {t('contact-sales-description')}
        </CardDescription>
      </CardHeader>

      <FormProvider {...form}>
        <Form method="POST" onSubmit={onSubmit}>
          <fieldset className="space-y-6" disabled={isContactingSales}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('first-name-label')}</FormLabel>

                    <FormControl>
                      <Input
                        autoComplete="given-name"
                        placeholder={t('first-name-placeholder')}
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('last-name-label')}</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="family-name"
                        placeholder={t('last-name-placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('company-name-label')}</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="organization"
                        placeholder={t('company-name-placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('work-email-label')}</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="email"
                        placeholder={t('work-email-placeholder')}
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('phone-number-label')}</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="tel"
                        placeholder={t('phone-number-placeholder')}
                        type="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('message-label')}</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[90px] resize-none"
                        placeholder={t('message-placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <HoneypotInputs label="Please leave this field blank" />
            </CardContent>

            <CardFooter className="flex flex-col items-start space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <Text className="leading-5">{t('submit-disclaimer')}</Text>

              <Button
                {...form.register('intent', { value: 'contactSales' })}
                type="submit"
              >
                {isContactingSales ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    {t('contacting-sales')}
                  </>
                ) : (
                  <>{t('contact-sales')}</>
                )}
              </Button>
            </CardFooter>
          </fieldset>
        </Form>
      </FormProvider>
    </Card>
  );
}
