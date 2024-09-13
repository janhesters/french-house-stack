import type { Pick } from '@prisma/client/runtime/library';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { promiseHash } from 'remix-utils/promise';

import { getPageTitle } from '../localization/get-page-title.server';
import { i18next } from '../localization/i18next.server';
import { getInviteLinkToken } from '../organizations/organizations-helpers.server';
import { requireAnonymous } from './user-authentication-helpers.server';

const authenticationLoader =
  (tKey: string) =>
  async ({ request }: Pick<LoaderFunctionArgs, 'request'>) => {
    const { t, ...rest } = await promiseHash({
      request: requireAnonymous(request),
      t: i18next.getFixedT(request),
      locale: i18next.getLocale(request),
    });

    return json({
      ...rest,
      t,
      pageTitle: getPageTitle(t, tKey, ''),
      token: getInviteLinkToken(request) || '',
    });
  };

export const loginLoader = authenticationLoader('login:login');

export const registerLoader = authenticationLoader('register:register');
