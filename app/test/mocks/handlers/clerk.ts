import { http, HttpResponse } from 'msw';

export const clerkHandlers = [
  http.get(
    /https:\/\/([\dA-Za-z]+(-[\dA-Za-z]+)+)\.clerk\.accounts\.dev\/v1\/client\?_clerk_js_version=(\d+(\.\d+)+)&__clerk_db_jwt=([\dA-Za-z]+(_[\dA-Za-z]+)+)/,
    () => HttpResponse.json({ message: 'success' }, { status: 200 }),
  ),
  http.post(
    /https:\/\/([\dA-Za-z]+(-[\dA-Za-z]+)+)\.clerk\.accounts\.dev\/v1\/environment\?_clerk_js_version=(\d+(\.\d+)+)&_method=PATCH&__clerk_db_jwt=([\dA-Za-z]+(_[\dA-Za-z]+)+)/,
    () => HttpResponse.json({ message: 'success' }, { status: 200 }),
  ),
  http.get(
    /https:\/\/([\dA-Za-z]+(-[\dA-Za-z]+)+)\.clerk\.accounts\.dev\/npm\/@clerk\/clerk-js@5\/dist\/clerk\.browser\.js/,
    () => HttpResponse.json({ message: 'success' }, { status: 200 }),
  ),

  http.get(
    /https:\/\/([\dA-Za-z]+(-[\dA-Za-z]+)+)\.clerk\.accounts\.dev\/npm\/@clerk\/clerk-js@5\.24\.0\/dist\/clerk\.browser\.js/,
    () => HttpResponse.json({ message: 'success' }, { status: 200 }),
  ),

  http.get(
    /https:\/\/([\dA-Za-z]+(-[\dA-Za-z]+)+)\.clerk\.accounts\.dev\/npm\/@clerk\/clerk-js@5\.24\.0\/dist\/ui-common_476f85_5\.24\.0\.js/,
    () => HttpResponse.json({ message: 'success' }, { status: 200 }),
  ),

  http.get(
    /https:\/\/([\dA-Za-z]+(-[\dA-Za-z]+)+)\.clerk\.accounts\.dev\/npm\/@clerk\/clerk-js@5\.24\.0\/dist\/vendors_476f85_5\.24\.0\.js/,
    () => HttpResponse.json({ message: 'success' }, { status: 200 }),
  ),

  http.get(
    /https:\/\/([\dA-Za-z]+(-[\dA-Za-z]+)+)\.clerk\.accounts\.dev\/v1\/client\/handshake\?redirect_url=http%3A%2F%2Flocalhost%3A3000%2F&suffixed_cookies=false&__clerk_hs_reason=dev-browser-missing/,
    () => HttpResponse.json({ message: 'success' }, { status: 200 }),
  ),
];
