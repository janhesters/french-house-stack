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

export function TypographyH2({
  className,
  ...props
}: ComponentPropsWithoutRef<'h2'>) {
  return (
    <h2
      className={cn(
        'mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0',
        className,
      )}
      {...props}
    />
  );
}

export function TypographyH3({
  className,
  ...props
}: ComponentPropsWithoutRef<'h3'>) {
  return (
    <h3
      className={cn(
        'mt-8 scroll-m-20 text-2xl font-semibold tracking-tight',
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
