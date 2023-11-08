import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';

import { userAuthenticationSessionStorage } from './user-authentication-session.server';

export const authenticator = new Authenticator<string>(
  userAuthenticationSessionStorage,
);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    //
  }),
  'email',
);
