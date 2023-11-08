import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { forwardRef, useId } from 'react';

import { cn } from '~/utils/shadcn';

import { InputErrorMessage } from './input-error-message';
import type { InputProps } from './ui/input';
import { Input } from './ui/input';

type InputWithErrorProps = InputProps & {
  error?: string;
};

export const InputWithError = forwardRef<HTMLInputElement, InputWithErrorProps>(
  function InputWithError({ className, error, id, ...props }, ref) {
    const fallbackId = useId();
    const errorId = id ? `${id}Error` : fallbackId;

    return (
      <>
        <div className={cn('relative rounded-md shadow-sm', className)}>
          <Input
            {...props}
            ref={ref}
            id={id}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? true : undefined}
            className={cn(
              error &&
                'pr-10 text-red-900 shadow-none ring-red-300 placeholder:text-red-300 focus:ring-red-500 dark:text-red-600/100 dark:ring-red-400 dark:placeholder:text-red-400/70 dark:focus:ring-red-500/80',
            )}
          />

          {error && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ExclamationCircleIcon
                aria-hidden="true"
                className="h-5 w-5 text-red-500 dark:text-red-600"
              />
            </div>
          )}
        </div>

        {error && <InputErrorMessage id={errorId}>{error}</InputErrorMessage>}
      </>
    );
  },
);
