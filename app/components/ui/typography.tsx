import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '~/utils/shadcn-ui';

export function TypographyH1({
  className,
  ...props
}: ComponentPropsWithoutRef<'h1'>) {
  return (
    <h1
      className={cn(
        'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
        className,
      )}
      {...props}
    />
  );
}

export function TypographyP({
  className,
  ...props
}: ComponentPropsWithoutRef<'p'>) {
  return (
    <p
      className={cn(className, 'leading-7 [&:not(:first-child)]:mt-6')}
      {...props}
    />
  );
}
