import type { SeparatorProps } from '@radix-ui/react-separator';
import {
  Form,
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import { ArrowLeftCircleIcon, BellIcon, SearchIcon } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '~/utils/shadcn-ui';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Separator } from './ui/separator';

export function Header({
  className,
  ...props
}: ComponentPropsWithoutRef<'header'>) {
  return (
    <header
      {...props}
      className={cn(
        'flex h-13 items-center gap-x-2 border-b pl-2 pr-2 shadow-sm md:pr-4 dark:shadow-none',
        className,
      )}
    />
  );
}

export function HeaderBackButton() {
  const { t } = useTranslation('header');
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  return (
    <Button
      aria-label={t('go-back')}
      onClick={goBack}
      variant="ghost"
      size="icon"
    >
      <ArrowLeftCircleIcon aria-hidden="true" className="size-5" />
    </Button>
  );
}

export function HeaderTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<'h1'>) {
  return (
    <h1
      {...props}
      className={cn('line-clamp-2 flex-1 text-lg font-semibold', className)}
    />
  );
}

export function HeaderSeperator({ className, ...props }: SeparatorProps) {
  return (
    <Separator
      {...props}
      className={cn('mx-2 h-6', className)}
      orientation="vertical"
    />
  );
}

export function HeaderSearchBar() {
  const { t } = useTranslation('header');
  const location = useLocation();
  const currentPath = location.pathname;
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  return (
    <Form action={currentPath} className="relative flex flex-1" replace>
      <label className="sr-only" htmlFor="search-field">
        {t('search')}
      </label>

      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-2 h-full w-5 text-gray-400"
      />

      <Input
        className="pl-10"
        defaultValue={searchQuery}
        id="search-field"
        name="search"
        placeholder={t('search-placeholder')}
        type="search"
      />
    </Form>
  );
}

type HeaderNotificationsBellProps = {
  notifications: number;
};

export function HeaderNotificationsBell({
  notifications,
}: HeaderNotificationsBellProps) {
  const { t } = useTranslation('header');

  return (
    <Button className="relative" size="icon" variant="ghost">
      <BellIcon aria-hidden="true" className="size-6" />

      <span className="sr-only">
        {notifications === 0
          ? t('view-notifications')
          : t('view-n-new-notifications', {
              count: notifications,
            })}
      </span>

      {notifications > 0 && (
        <span className="absolute right-2.5 top-2 block size-2 rounded-full bg-destructive ring-2 ring-background" />
      )}
    </Button>
  );
}

type UserNavigationItem = {
  name: string;
  href: string;
};

export type HeaderUserProfileDropDownProps = {
  avatar?: string;
  abbreviation: string;
  email: string;
  name: string;
  items: UserNavigationItem[];
};

export function HeaderUserProfileDropdown(
  props: HeaderUserProfileDropDownProps,
) {
  const { t } = useTranslation('header');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="relative h-8 w-8 rounded-full"
          aria-label={t('open-user-menu')}
          variant="ghost"
        >
          <Avatar className="size-8">
            <AvatarImage alt={props.name} src={props.avatar} />

            <AvatarFallback>{props.abbreviation}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{props.name}</p>

            <p className="text-xs leading-none text-muted-foreground">
              {props.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {props.items.length > 0 && (
          <>
            <DropdownMenuGroup>
              {props.items.map(item => (
                <Link key={item.name} to={item.href}>
                  <DropdownMenuItem>{t(item.name)}</DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
          </>
        )}

        <form className="w-full" method="POST" action="/logout">
          <button className="w-full" type="submit">
            <DropdownMenuItem>{t('log-out')}</DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
