import { describe, expect, test } from 'vitest';

describe('login()', () => {
  test.todo(
    'given an anonymous request, a user id, and a redirect destination: creates a user auth session, adds a cookie for that session to the request and redirects to the redirect destination',
    () => {},
  );
});

describe('logout()', () => {
  test.todo(
    'given an anonymous request: redirects the user to the landing page',
    () => {},
  );

  test.todo(
    'given a request with a session cookie set, but no session exists in the database: clears the cookie and redirects the user to the landing page',
    () => {},
  );

  test.todo(
    'given a request with an expired session: deletes the session, clears the cookie and redirects the user to the landing page',
    () => {},
  );

  test.todo(
    'given a request with an active session: deletes the session, clears the cookie, logs out the user from magic and redirects to the landing page',
    () => {},
  );

  test.todo(
    'given a request with an active session, and the call to the magic services fails: deletes the session, clears the cookie and redirects the user to the landing page',
    () => {},
  );
});

describe('createCookieAndUserAuthSessionForUserId()', () => {});

// async function sendAuthenticatedRequest({
//   userId,
//   formData = toFormData(createBody()),
//   params,
// }: {
//   userId: string;
//   formData?: FormData;
//   organizationSlug: Params;
// }) {
//   const url = createUrl(organizationSlug);
//   const request = await createAuthenticatedRequest({ url, userId, formData });

//   // 📡 Send request.
//   const response = await action({ request, context: {}, params });
//   return response;
// }
