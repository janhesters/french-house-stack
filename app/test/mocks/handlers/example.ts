import { http, HttpResponse } from 'msw';

const exampleComRegex = /(^https?:\/\/)?(www\.)?example\.com($|\/)/;

export const exampleHandlers = [
  http.post(exampleComRegex, () =>
    HttpResponse.json({ message: 'Created' }, { status: 201 }),
  ),
];
