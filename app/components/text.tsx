import { Link } from '@remix-run/react';
import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '~/utils/shadcn-ui';

export function Text({ className, ...props }: ComponentPropsWithoutRef<'p'>) {
  return (
    <p
      className={cn('text-sm leading-7 text-muted-foreground', className)}
      {...props}
    />
  );
}

export function TextLink({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Link>) {
  return (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <Link
      className={cn(
        'rounded-sm underline underline-offset-4 ring-offset-background hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
      {...props}
    />
  );
}

export function Strong({
  className,
  ...props
}: ComponentPropsWithoutRef<'strong'>) {
  return (
    <strong
      className={cn('font-medium text-foreground', className)}
      {...props}
    />
  );
}

export function Code({
  className,
  ...props
}: ComponentPropsWithoutRef<'code'>) {
  return (
    <code
      className={cn(
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
        className,
      )}
      {...props}
    />
  );
}
