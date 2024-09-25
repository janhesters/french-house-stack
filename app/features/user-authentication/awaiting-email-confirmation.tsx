import { Trans } from 'react-i18next';

import { Text, TextLink } from '~/components/text';
import { Button } from '~/components/ui/button';
import { TypographyH1 } from '~/components/ui/typography';
import { useTranslation } from '~/features/localization/use-translation';

export const RegisterAwaitingEmailVerification = ({
  onCancel,
  email,
  token,
}: {
  onCancel?: () => void;
  email: string;
  token?: string;
}) => {
  const { t } = useTranslation('register');

  return (
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <TypographyH1 className="mt-2 text-center text-2xl font-semibold lg:text-2xl">
        {t('verify-email')}
      </TypographyH1>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
        <Text className="text-center">
          <Trans
            components={{ 1: <span className="font-medium" /> }}
            i18nKey="register:verify-email-description"
            values={{ email }}
          />
        </Text>
      </div>

      <div className="mt-6 flex flex-col">
        <Button onClick={onCancel}>{t('back-to-register')}</Button>
        <Text className="mt-2">
          {t('already-a-member')}{' '}
          <TextLink to={`/login${token ? `?token=${token}` : ''}`}>
            {t('log-in-to-your-account')}
          </TextLink>
        </Text>
      </div>
    </div>
  );
};
export const AwaitingLoginEmailVerification = ({
  email,
  onCancel,
}: {
  onCancel?: () => void;
  email: string;
}) => {
  const { t } = useTranslation('login');

  return (
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <TypographyH1 className="mt-2 text-center text-2xl font-semibold lg:text-2xl">
        {t('verify-email')}
      </TypographyH1>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
        <Text className="text-center">
          <Trans
            components={{ 1: <span className="font-medium" /> }}
            i18nKey="login:verify-email-description"
            values={{ email }}
          />
        </Text>
      </div>

      <div className="mt-6 flex flex-col">
        <Button onClick={onCancel}>{t('back-to-login')}</Button>
      </div>
    </div>
  );
};
