import { json } from '@remix-run/node';

import { asyncPipe } from '~/utils/async-pipe';

import { withLocalization } from '../localization/localization-middleware.server';
import { withInviteLinkToken } from '../organizations/organizations-middleware.server';
import { withAnonymousUser } from './user-authentication-middleware.server';

export const loginLoader = asyncPipe(
  withAnonymousUser,
  withLocalization({ tKey: 'login:login' }),
  withInviteLinkToken,
  json,
);

export const registerLoader = asyncPipe(
  withAnonymousUser,
  withLocalization({ tKey: 'register:register' }),
  withInviteLinkToken,
  json,
);
