import {
  Form,
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import {
  ArrowLeftCircleIcon,
  BellIcon,
  MenuIcon,
  SearchIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { useTranslation } from '~/features/localization/use-translation';
import { cn } from '~/utils/shadcn-ui';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button, buttonVariants } from './ui/button';
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
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Sheet, SheetContent } from './ui/sheet';

type Icon = typeof MenuIcon;

export type NavigationItemWithChildrenProps = {
  name: string;
  icon: Icon;
  children: Array<{ name: string; href: string; count?: number }>;
};

function NavigationItemWithChildren(item: NavigationItemWithChildrenProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const matchedPaths = item.children.map(({ href }) =>
    currentPath.startsWith(href),
  );
  const isActive = matchedPaths.some(Boolean);

  return (
    <li>
      <Accordion type="single" collapsible>
        <AccordionItem className="border-none" value="item-1">
          <AccordionTrigger
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'w-full justify-between hover:no-underline',
              isActive && 'bg-accent text-accent-foreground',
            )}
          >
            <span className="flex items-center">
              <item.icon className="mr-2 size-4" aria-hidden="true" />

              {item.name}
            </span>
          </AccordionTrigger>

          <AccordionContent asChild>
            <ul className="mt-1 space-y-0.5 px-2">
              {item.children.map((subItem, index) => (
                <li key={subItem.name}>
                  <Link
                    className={cn(
                      buttonVariants({ variant: 'ghost' }),
                      'w-full justify-start',
                      matchedPaths[index] && 'bg-accent text-accent-foreground',
                    )}
                    to={subItem.href}
                  >
                    {subItem.name}
                  </Link>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </li>
  );
}

export type SingleNavigationItem = {
  name: string;
  href: string;
  icon: Icon;
  count?: number;
};

type NavigationItem = SingleNavigationItem | NavigationItemWithChildrenProps;

type NavigationItemGroup = {
  id: string;
  name?: string;
  items: NavigationItem[];
};

type UserNavigationItem = {
  name: string;
  href: string;
};

export type SidebarUserNavigation = {
  avatar?: string;
  abbreviation: string;
  email: string;
  name: string;
  items: UserNavigationItem[];
};

export type SidebarProps = {
  headerTitle?: ReactNode;
  navigation: NavigationItemGroup[];
  notifications?: number;
  renderBackButton?: boolean;
  renderSearchBar?: boolean;
  renderStaticSidebar?: boolean;
  sidebarTitle?: ReactNode;
  userNavigation: SidebarUserNavigation;
};

function SidebarContent({
  navigation,
  sidebarTitle,
}: Pick<SidebarProps, 'navigation' | 'sidebarTitle'>) {
  return (
    <>
      {/* Little "header area" of the side bar. */}
      <div>
        {typeof sidebarTitle === 'string' ? (
          <div className="flex h-13 items-center border-b px-4 text-xl font-bold text-primary">
            {sidebarTitle}
          </div>
        ) : (
          sidebarTitle
        )}
      </div>

      {/* Mapping through all the navigation groups and rendering them. */}
      <ScrollArea>
        <ul className="space-y-2 p-2">
          {navigation.map(group => (
            <li key={group.id}>
              {group.name && (
                <div className="mb-2 px-4 text-xs font-semibold text-muted-foreground">
                  {group.name}
                </div>
              )}

              <ul className="space-y-1">
                {group.items.map(item => {
                  if ('children' in item) {
                    return (
                      <NavigationItemWithChildren key={item.name} {...item} />
                    );
                  }

                  return (
                    <li key={item.name}>
                      <NavLink
                        className={({ isActive }) =>
                          cn(
                            buttonVariants({ variant: 'ghost' }),
                            'w-full justify-start',
                            isActive && 'bg-accent text-accent-foreground',
                          )
                        }
                        to={item.href}
                      >
                        <>
                          <item.icon
                            aria-hidden="true"
                            className="mr-2 size-4"
                          />

                          {item.name}
                        </>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </>
  );
}

export function Sidebar({
  headerTitle,
  navigation,
  notifications,
  renderBackButton = false,
  renderSearchBar = false,
  renderStaticSidebar = true,
  sidebarTitle,
  userNavigation,
}: SidebarProps) {
  const { t } = useTranslation('sidebar');

  /** Sidebar open state */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /** Back button navigation logic */
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  /** Search bar query param management */
  const location = useLocation();
  const currentPath = location.pathname;
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  return (
    <div>
      {/* Burger menu sidebar for mobile */}
      <Sheet onOpenChange={setSidebarOpen} open={sidebarOpen}>
        <SheetContent
          className="mr-16 w-full max-w-xs p-0"
          closeButtonLabel={t('close-sidebar')}
          side="left"
        >
          <nav aria-label={t('sidebar')} className="flex h-dvh flex-col">
            <SidebarContent
              navigation={navigation}
              sidebarTitle={sidebarTitle}
            />
          </nav>
        </SheetContent>
      </Sheet>

      {/* Static sidebar for desktop */}
      {renderStaticSidebar && (
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <nav
            aria-label={t('sidebar')}
            className="flex h-dvh flex-col border-r"
          >
            <SidebarContent
              navigation={navigation}
              sidebarTitle={sidebarTitle}
            />
          </nav>
        </div>
      )}

      <div className={cn(renderStaticSidebar && 'lg:pl-72')}>
        <header className="flex h-13 items-center gap-x-2 border-b pl-2 pr-2 shadow-sm md:pr-4 dark:shadow-none">
          {/* Burger menu button */}
          <Button
            aria-label={t('open-sidebar')}
            className={cn(renderStaticSidebar && 'lg:hidden')}
            onClick={() => setSidebarOpen(true)}
            size="icon"
            variant="ghost"
          >
            <MenuIcon aria-hidden="true" className="size-6" />
          </Button>

          {/* Back button */}
          {renderBackButton && (
            <Button
              aria-label={t('go-back')}
              onClick={goBack}
              variant="ghost"
              size="icon"
            >
              <ArrowLeftCircleIcon aria-hidden="true" className="size-5" />
            </Button>
          )}

          <Separator className="mx-2 h-6 lg:hidden" orientation="vertical" />

          {/* Header page title */}
          {headerTitle ? (
            <h1
              className={cn(
                renderSearchBar
                  ? 'sr-only'
                  : 'line-clamp-2 flex-1 text-lg font-semibold',
              )}
            >
              {headerTitle}
            </h1>
          ) : (
            <div className="flex-1" />
          )}

          {renderSearchBar && (
            <Form action={currentPath} className="relative flex flex-1" replace>
              <label className="sr-only" htmlFor="search-field">
                {t('search')}
              </label>

              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-2 h-full w-5 text-gray-400"
              />

              <Input
                id="search-field"
                className="pl-10"
                defaultValue={searchQuery}
                placeholder={t('search-placeholder')}
                name="search"
                type="search"
              />
            </Form>
          )}

          <div className="flex items-center gap-x-2">
            {/* Notifications bell */}
            {typeof notifications === 'number' && (
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
            )}

            <Separator
              className="mx-2 hidden h-6 lg:block"
              orientation="vertical"
            />

            {/* User profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="relative h-8 w-8 rounded-full"
                  aria-label={t('open-user-menu')}
                  variant="ghost"
                >
                  <Avatar className="size-8">
                    <AvatarImage
                      alt={userNavigation.name}
                      src={userNavigation.avatar}
                    />

                    <AvatarFallback>
                      {userNavigation.abbreviation}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userNavigation.name}
                    </p>

                    <p className="text-xs leading-none text-muted-foreground">
                      {userNavigation.email}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {userNavigation.items.length > 0 && (
                  <>
                    <DropdownMenuGroup>
                      {userNavigation.items.map(item => (
                        <DropdownMenuItem key={item.name}>
                          {item.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem>
                  <form method="POST" action="/logout">
                    <button type="submit">{t('log-out')}</button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
