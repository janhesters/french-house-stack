import { redirect } from '@remix-run/node';

/**
 * This functions enforces https protocol in production evironments and would redirect the user
 * to a url using the https protocol if http and not localhost
 *
 * @param request - the incoming request
 * @throw a redirect to the https route if current protocol used is http and not localhost
 * being used
 */
export const enforceHttps = (request: Request) => {
  const url = new URL(request.url);
  const hostname = url.hostname;
  const protocol = request.headers.get('X-Forwarded-Proto') ?? url.protocol;

  url.host =
    request.headers.get('X-Forwarded-Host') ??
    request.headers.get('host') ??
    url.host;
  url.protocol = 'https:';

  if (protocol === 'http' && hostname !== 'localhost') {
    throw redirect(url.toString(), {
      headers: {
        'X-Forwarded-Proto': 'https',
      },
    });
  }
};
