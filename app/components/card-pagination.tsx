import { Trans, useTranslation } from 'react-i18next';

import { cn } from '~/utils/shadcn-ui';

import { DisableableLink } from './disableable-link';
import { Text } from './text';
import { buttonVariants } from './ui/button';

export type CardPaginationProps = {
  className?: string;
  currentPage: number;
  perPage?: number;
  totalItemCount: number;
};

export function CardPagination({
  className,
  currentPage,
  perPage = 10,
  totalItemCount,
}: CardPaginationProps) {
  const { t } = useTranslation('pagination');
  const min = (currentPage - 1) * perPage + 1;
  const max = Math.min(currentPage * perPage, totalItemCount);
  const disablePrevious = currentPage === 1;
  const disableNext = currentPage * perPage >= totalItemCount;

  return (
    <nav
      aria-label={t('pagination')}
      className={cn('flex items-center justify-between', className)}
    >
      <div className="hidden sm:block">
        <Text>
          <Trans
            components={{ 1: <span className="font-medium" /> }}
            i18nKey="pagination:showing-min-to-max-of-total-items-results"
            values={{ min, max, totalItemCount }}
          />
        </Text>
      </div>

      <div className="flex flex-1 justify-between space-x-3 sm:justify-end">
        <DisableableLink
          className={cn(
            buttonVariants({ size: 'sm', variant: 'outline' }),
            disablePrevious &&
              'cursor-not-allowed opacity-50 hover:bg-background',
          )}
          disabled={disablePrevious}
          to={`.?page=${currentPage - 1}`}
        >
          {t('previous')}
        </DisableableLink>

        <DisableableLink
          className={cn(
            buttonVariants({ size: 'sm', variant: 'outline' }),
            disableNext && 'cursor-not-allowed opacity-50 hover:bg-background',
          )}
          disabled={disableNext}
          to={`.?page=${currentPage + 1}`}
        >
          {t('next')}
        </DisableableLink>
      </div>
    </nav>
  );
}
