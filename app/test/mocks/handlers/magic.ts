import { http, HttpResponse } from 'msw';

export const magicHandlers = [
  http.post('https://api.magic.link/v2/admin/auth/user/logout', () =>
    HttpResponse.json({ message: 'success' }, { status: 200 }),
  ),
];
