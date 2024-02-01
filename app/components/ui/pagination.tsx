import type { NavLinkProps } from '@remix-run/react';
import { NavLink } from '@remix-run/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from 'lucide-react';
import * as React from 'react';

import type { ButtonProps } from '~/components/ui/button';
import { buttonVariants } from '~/components/ui/button';
import { useTranslation } from '~/features/localization/use-translation';
import { cn } from '~/utils/shadcn-ui';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => {
  const { t } = useTranslation('pagination');

  return (
    <nav
      role="navigation"
      aria-label={t('pagination')}
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
};
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = Pick<ButtonProps, 'size'> & NavLinkProps;

const PaginationLink = ({
  className,
  size = 'icon',
  ...props
}: PaginationLinkProps) => (
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  <NavLink
    className={({ isActive }) =>
      cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
        }),
        className,
      )
    }
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  const { t } = useTranslation('pagination');

  return (
    <PaginationLink
      aria-label={t('go-to-previous-page')}
      size="default"
      className={cn('gap-1 pl-2.5', className)}
      {...props}
    >
      <ChevronLeftIcon className="h-4 w-4" />

      <span>{t('previous')}</span>
    </PaginationLink>
  );
};
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  const { t } = useTranslation('pagination');

  return (
    <PaginationLink
      aria-label={t('go-to-next-page')}
      size="default"
      className={cn('gap-1 pr-2.5', className)}
      {...props}
    >
      <span>{t('next')}</span>

      <ChevronRightIcon className="h-4 w-4" />
    </PaginationLink>
  );
};
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => {
  const { t } = useTranslation('pagination');

  return (
    <span
      aria-hidden
      className={cn('flex h-9 w-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontalIcon className="h-4 w-4" />

      <span className="sr-only">{t('more')}</span>
    </span>
  );
};
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
