import { rest } from 'msw';

const exampleComRegex = /(^https?:\/\/)?(www\.)?example\.com($|\/)/;

export const exampleHandlers = [
  rest.post(exampleComRegex, (request, response, context) =>
    response(context.status(201), context.json({ message: 'Created' })),
  ),
];
