import 'dotenv/config';

import { installGlobals } from '@remix-run/node';
import { parse } from 'cookie';
import { defineConfig } from 'cypress';

import { USER_AUTHENTICATION_SESSION_NAME } from '~/features/user-authentication/user-authentication-constants.server';
import { createUserSession } from '~/features/user-authentication/user-authentication-session.server';

installGlobals();

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      on('task', {
        async createUserSession(userId: string) {
          const response = await createUserSession({
            redirectTo: '/',
            remember: false,
            request: new Request('http://localhost:3000/'),
            userId,
          });
          const cookieValue = response.headers.get('Set-Cookie');

          if (!cookieValue) {
            throw new Error('Cookie missing from createUserSession response');
          }

          const parsedCookie = parse(cookieValue);
          return parsedCookie[USER_AUTHENTICATION_SESSION_NAME];
        },
      });
    },
  },
  env: {
    /**
     * @see https://magic.link/docs/introduction/test-mode
     */
    invalidMagicEmail: 'test+fail@magic.link',
    validMagicEmail: 'test+success@magic.link',
    validCookieToken: process.env.VALID_COOKIE_TOKEN,
  },
  fixturesFolder: false,
});
