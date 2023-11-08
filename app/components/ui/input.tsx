import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '~/utils/shadcn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'block w-full rounded-md border-0 py-1.5 text-foreground shadow-sm ring-1 ring-inset ring-input placeholder:text-placeholder focus:ring-2 focus:ring-inset focus:ring-ring disabled:opacity-50 dark:bg-background dark:text-foreground dark:ring-input dark:placeholder:text-placeholder dark:focus:ring-ring sm:text-sm sm:leading-6',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
