import { Form, useNavigation } from '@remix-run/react';
import copyToClipboard from 'copy-to-clipboard';
import {
  AlertTriangleIcon,
  ClipboardCheckIcon,
  CopyIcon,
  Loader2Icon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Text } from '~/components/text';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { inputClassName } from '~/components/ui/input';
import { cn } from '~/utils/shadcn-ui';

import { useTranslation } from '../localization/use-translation';

export type TeamMembersInviteLinkCardComponentProps = {
  inviteLink?: { href: string; expiryDate: string };
};

export function TeamMembersInviteLinkCardComponent({
  inviteLink,
}: TeamMembersInviteLinkCardComponentProps) {
  const { t } = useTranslation('organization-team-members');

  const [linkCopied, setLinkCopied] = useState(false);

  // Focus management, so that the input's auto focus the link if it changes.
  const mounted = useRef<boolean | null>(null);
  const inviteLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (mounted.current && inviteLink?.href) {
      setLinkCopied(false);
      inviteLinkRef.current?.focus();
    }

    // Guard against React 18's ghost remount.
    mounted.current = mounted.current === null ? false : true;
  }, [inviteLink?.href]);

  const navigation = useNavigation();
  const isCreatingNewLink =
    navigation.formData?.get('intent') === 'createNewInviteLink';
  const isDeactivatingLink =
    navigation.formData?.get('intent') === 'deactivateInviteLink';
  const isSubmitting = isCreatingNewLink || isDeactivatingLink;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('card-title-invite-link')}</CardTitle>

        <CardDescription>{t('card-description-invite-link')}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {inviteLink ? (
          <>
            <div className="relative">
              <a
                aria-describedby="link-expiration-warning"
                aria-label={t('go-to-link')}
                className={cn(
                  inputClassName,
                  'items-center pr-12 read-only:cursor-pointer read-only:opacity-100',
                )}
                href={inviteLink.href}
                ref={inviteLinkRef}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span aria-hidden="true" className="w-full truncate">
                  {inviteLink.href}
                </span>
              </a>

              <Button
                className="absolute right-0 top-0 rounded-l-none border-l"
                onClick={() => {
                  copyToClipboard(inviteLink.href);
                  setLinkCopied(true);
                }}
                variant="ghost"
                size="icon"
              >
                {linkCopied ? (
                  <>
                    <ClipboardCheckIcon className="size-4" />

                    <span className="sr-only">{t('invite-link-copied')}</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="size-4" />

                    <span className="sr-only">{t('copy-invite-link')}</span>
                  </>
                )}
              </Button>

              <Text className="mt-1 flex text-xs" id="link-expiration-warning">
                <span className="grow">
                  {t('link-valid-until', {
                    date: inviteLink.expiryDate,
                  })}
                </span>

                <span
                  aria-live="polite"
                  aria-hidden={linkCopied ? 'false' : 'true'}
                  className={cn(
                    'transform text-primary transition duration-300 ease-in-out',
                    linkCopied
                      ? 'translate-x-0 scale-100 opacity-100'
                      : 'translate-x-10 scale-75 opacity-0',
                  )}
                >
                  {t('copied')}
                </span>
              </Text>
            </div>

            <div className="flex items-center gap-2">
              <Form className="grow" method="POST" replace>
                <Button
                  aria-describedby="link-regenerate-warning"
                  className="w-full"
                  disabled={isSubmitting}
                  name="intent"
                  value="createNewInviteLink"
                  type="submit"
                >
                  {isCreatingNewLink ? (
                    <>
                      <Loader2Icon className="mr-2 size-4 animate-spin" />
                      {t('regenerating')}
                    </>
                  ) : (
                    <>{t('regenerate-link')}</>
                  )}
                </Button>
              </Form>

              <Form method="POST" replace>
                <Button
                  disabled={isSubmitting}
                  name="intent"
                  value="deactivateInviteLink"
                  type="submit"
                  variant="secondary"
                >
                  {isDeactivatingLink ? (
                    <>
                      <Loader2Icon className="mr-2 size-4 animate-spin" />
                      {t('deactivating')}
                    </>
                  ) : (
                    <>{t('deactivate-link')}</>
                  )}
                </Button>
              </Form>
            </div>

            <Text
              className="flex items-center text-xs"
              id="link-regenerate-warning"
            >
              <AlertTriangleIcon
                aria-hidden="true"
                className="mr-1.5 size-4 text-primary"
              />

              <span>{t('new-link-deactivates-old')}</span>
            </Text>
          </>
        ) : (
          <Form className="flex justify-center" method="POST" replace>
            <Button
              disabled={isSubmitting}
              name="intent"
              value="createNewInviteLink"
              type="submit"
            >
              {isCreatingNewLink ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  {t('creating')}
                </>
              ) : (
                <>{t('create-new-invite-link')}</>
              )}
            </Button>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
