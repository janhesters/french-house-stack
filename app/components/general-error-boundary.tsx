import type { ErrorResponse } from '@remix-run/react';
import {
  isRouteErrorResponse,
  useParams,
  useRouteError,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';

import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { getErrorMessage } from '~/utils/get-error-message';

type StatusHandler = (info: {
  error: ErrorResponse;
  params: Record<string, string | undefined>;
}) => JSX.Element | null;

const ErrorMessage = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="flex h-full flex-col p-2">
    <Alert
      className="flex h-full flex-col items-center justify-center"
      variant="destructive"
    >
      <AlertTitle className="font-semibold">{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  </div>
);

/**
 * @see https://github.com/epicweb-dev/epic-stack/blob/main/app/components/error-boundary.tsx
 */
export function GeneralErrorBoundary({
  defaultStatusHandler = ({ error }) => (
    <ErrorMessage
      title={`${error.status} ${error.statusText}`}
      description={error.data}
    />
  ),
  statusHandlers,
  unexpectedErrorHandler = error => (
    <ErrorMessage title="Oh snap!" description={getErrorMessage(error)} />
  ),
}: {
  defaultStatusHandler?: StatusHandler;
  statusHandlers?: Record<number, StatusHandler>;
  unexpectedErrorHandler?: (error: unknown) => JSX.Element | null;
}) {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  const params = useParams();

  if (typeof document !== 'undefined') {
    console.error(error);
  }

  return (
    <div className="h-full">
      {isRouteErrorResponse(error)
        ? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
            error,
            params,
          })
        : unexpectedErrorHandler(error)}
    </div>
  );
}
