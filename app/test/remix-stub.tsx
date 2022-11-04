/* eslint-disable unicorn/no-null */
import type { ShouldReloadFunction } from '@remix-run/react';
// FIX: This nested import breaks vite's dev bundling and needs a workaround in /.storybook/main.ts
//      Hopefully an equivalent will be properly exported in Remix v2.
import { RemixEntry } from '@remix-run/react/dist/components';
import type { AssetsManifest, EntryContext } from '@remix-run/react/dist/entry';
import type { RouteData } from '@remix-run/react/dist/routeData';
import type {
  CatchBoundaryComponent,
  RouteModules,
} from '@remix-run/react/dist/routeModules';
import type { EntryRoute, RouteManifest } from '@remix-run/react/dist/routes';
import type {
  ActionFunction,
  InitialEntry,
  LoaderFunction,
  Location,
  StaticHandler,
} from '@remix-run/router';
import {
  matchRoutes,
  unstable_createStaticHandler as createStaticHandler,
} from '@remix-run/router';
import type { AgnosticRouteMatch } from '@remix-run/router/dist/utils';
import type {
  ErrorBoundaryComponent,
  LinksFunction,
  MetaFunction,
} from '@remix-run/server-runtime';
import type { MemoryHistory, Update } from 'history';
import { createMemoryHistory } from 'history';
import { useLayoutEffect, useReducer, useRef } from 'react';

/**
 * Base RouteObject with common props shared by all types of mock routes
 */
type BaseMockRouteObject = {
  id?: string;
  caseSensitive?: boolean;
  path?: string;
  element?: React.ReactNode | null;
  loader?: LoaderFunction;
  action?: ActionFunction;
  links?: LinksFunction;
  meta?: MetaFunction;
  handle?: any;
  CatchBoundary?: CatchBoundaryComponent;
  ErrorBoundary?: ErrorBoundaryComponent;
  unstable_shouldReload?: ShouldReloadFunction;
};

/**
 * Index routes must not have children
 */
export declare type MockIndexRouteObject = BaseMockRouteObject & {
  children?: undefined;
  index: true;
};

/**
 * Non-index routes may have children, but cannot have index
 */
export declare type MockNonIndexRouteObject = BaseMockRouteObject & {
  children?: MockRouteObject[];
  index?: false;
};

/**
 * A route object represents a logical route, with (optionally) its child
 * routes organized in a tree-like structure.
 */
export declare type MockRouteObject =
  | MockIndexRouteObject
  | MockNonIndexRouteObject;

type RemixStubOptions = {
  /**
   *  The initial entries in the history stack. This allows you to start a test with
   *  multiple locations already in the history stack (for testing a back navigation, etc.)
   *  The test will default to the last entry in initialEntries if no initialIndex is provided.
   *  e.g. initialEntries-(["/home", "/about", "/contact"]}
   */
  initialEntries?: InitialEntry[];

  /**
   *  Used to set the route's initial loader data.
   *  e.g. initialLoaderData={("/contact": {locale: "en-US" }}
   */
  initialLoaderData?: RouteData;

  /**
   *  Used to set the route's initial action data.
   *  e.g. initialActionData={("/login": { errors: { email: "invalid email" } }}
   */
  initialActionData?: RouteData;

  /**
   * The initial index in the history stack to render. This allows you to start a test at a specific entry.
   * It defaults to the last entry in initialEntries.
   * e.g.
   *   initialEntries: ["/", "/events/123"]
   *   initialIndex: 1 // start at "/events/123"
   */
  initialIndex?: number;
};

export function createRemixStub(routes: MockRouteObject[]) {
  // Setup request handler to handle requests to the mock routes
  const { dataRoutes, queryRoute } = createStaticHandler(routes);
  return function RemixStub({
    initialEntries = ['/'],
    initialLoaderData = {},
    initialActionData,
    initialIndex,
  }: RemixStubOptions) {
    const historyRef = useRef<MemoryHistory>();
    if (historyRef.current == undefined) {
      historyRef.current = createMemoryHistory({
        initialEntries: initialEntries,
        initialIndex: initialIndex,
      });
    }

    let history = historyRef.current;
    let [state, dispatch] = useReducer((_: Update, update: Update) => update, {
      action: history.action,
      location: history.location,
    });

    useLayoutEffect(() => history.listen(dispatch), [history]);

    // Convert path based ids in user supplied initial loader/action data to data route ids
    const loaderData = convertRouteData(dataRoutes, initialLoaderData);
    const actionData = convertRouteData(dataRoutes, initialActionData);

    // Create mock remix context
    const remixContext = createRemixContext(
      dataRoutes,
      state.location,
      loaderData,
      actionData,
    );

    // Patch fetch so that mock routes can handle action/loader requests
    monkeyPatchFetch(queryRoute);

    return (
      <RemixEntry
        context={remixContext}
        action={state.action}
        location={state.location}
        navigator={history}
      />
    );
  };
}

function createRemixContext(
  routes: MockRouteObject[],
  currentLocation: Location,
  initialLoaderData?: RouteData,
  initialActionData?: RouteData,
): EntryContext {
  const manifest = createManifest(routes);
  const matches = matchRoutes(routes, currentLocation) || [];

  return {
    actionData: initialActionData,
    appState: {
      trackBoundaries: true,
      trackCatchBoundaries: true,
      catchBoundaryRouteId: null,
      renderBoundaryRouteId: null,
      loaderBoundaryRouteId: null,
      error: undefined,
      catch: undefined,
    },
    matches: convertToEntryRouteMatch(matches),
    routeData: initialLoaderData || [],
    manifest: manifest,
    routeModules: createRouteModules(routes),
  };
}

function createManifest(routes: MockRouteObject[]): AssetsManifest {
  return {
    routes: createRouteManifest(routes),
    entry: { imports: [], module: '' },
    url: '',
    version: '',
  };
}

function createRouteManifest(
  routes: MockRouteObject[],
  manifest?: RouteManifest<EntryRoute>,
  parentId?: string,
): RouteManifest<EntryRoute> {
  return routes.reduce((manifest, route) => {
    if (route.children) {
      createRouteManifest(route.children, manifest, route.id);
    }
    manifest[route.id!] = convertToEntryRoute(route, parentId);
    return manifest;
  }, manifest || {});
}

function createRouteModules(
  routes: MockRouteObject[],
  routeModules?: RouteModules,
): RouteModules {
  return routes.reduce((modules, route) => {
    if (route.children) {
      createRouteModules(route.children, modules);
    }
    modules[route.id!] = {
      CatchBoundary: route.CatchBoundary,
      ErrorBoundary: route.ErrorBoundary,
      default: () => <>{route.element}</>,
      handle: route.handle,
      links: route.links,
      meta: route.meta,
      unstable_shouldReload: route.unstable_shouldReload,
    };
    return modules;
  }, routeModules || {});
}

const originalFetch =
  typeof global !== 'undefined' ? global.fetch : window.fetch;
function monkeyPatchFetch(queryRoute: StaticHandler['queryRoute']) {
  const fetchPatch = async (
    input: RequestInfo | URL,
    init: RequestInit = {},
  ): Promise<Response> => {
    const request = new Request(input, init);
    try {
      // Send the request to mock routes via @remix-run/router rather than the normal
      // @remix-run/server-runtime so that stubs can also be used in browser environments.
      const response = await queryRoute(request);

      if (response instanceof Response) {
        return response;
      }

      return new Response(response, {
        status: 200,
        headers: { contentType: 'application/json' },
      });
    } catch (error) {
      if (
        error instanceof Response && // 404 or 405 responses passthrough to the original fetch as mock routes couldn't handle the request.
        (error.status === 404 || error.status === 405)
      ) {
        return originalFetch(input, init);
      }

      throw error;
    }
  };

  if (typeof global !== 'undefined') {
    global.fetch = fetchPatch;
  } else {
    window.fetch = fetchPatch;
  }
}

function convertToEntryRoute(
  route: MockRouteObject,
  parentId?: string,
): EntryRoute {
  return {
    id: route.id!,
    index: route.index,
    caseSensitive: route.caseSensitive,
    path: route.path,
    parentId: parentId,
    hasAction: !!route.action,
    hasLoader: !!route.loader,
    module: '',
    hasCatchBoundary: !!route.CatchBoundary,
    hasErrorBoundary: !!route.ErrorBoundary,
  };
}

function convertToEntryRouteMatch(
  routes: AgnosticRouteMatch<string, MockRouteObject>[],
) {
  return routes.map(match => {
    return {
      params: match.params,
      pathname: match.pathname,
      route: convertToEntryRoute(match.route),
    };
  });
}

// Converts route data from a path based index to a route id index value.
// e.g. { "/post/:postId": post } to { "0": post }
function convertRouteData(
  routes: MockRouteObject[],
  routeData?: RouteData,
): RouteData | undefined {
  if (!routeData) return undefined;
  return Object.keys(routeData).reduce((data, path) => {
    const routeId = routes.find(route => route.path === path)?.id;
    if (routeId) {
      data[routeId] = routeData[path];
    }
    return data;
  }, {} as RouteData);
}
