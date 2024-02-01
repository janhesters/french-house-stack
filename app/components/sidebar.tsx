import { Link, NavLink, Outlet, useLocation } from '@remix-run/react';
import { MenuIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { useTranslation } from '~/features/localization/use-translation';
import { cn } from '~/utils/shadcn-ui';

import type { HeaderUserProfileDropDownProps } from './header';
import {
  Header,
  HeaderBackButton,
  HeaderNotificationsBell,
  HeaderSearchBar,
  HeaderSeperator,
  HeaderTitle,
  HeaderUserProfileDropdown,
} from './header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Button, buttonVariants } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Sheet, SheetContent } from './ui/sheet';

type Icon = typeof MenuIcon;

export type NavigationItemWithChildrenProps = {
  name: string;
  icon: Icon;
  children: Array<{ name: string; href: string; count?: number }>;
  closeSidebar?: () => void;
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
                    onClick={item.closeSidebar}
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

export type SidebarProps = {
  closeSidebar?: () => void;
  headerTitle?: ReactNode;
  navigation: NavigationItemGroup[];
  notifications?: number;
  renderBackButton?: boolean;
  renderSearchBar?: boolean;
  renderStaticSidebar?: boolean;
  sidebarTitle?: ReactNode;
  userNavigation: HeaderUserProfileDropDownProps;
};

function SidebarContent({
  closeSidebar,
  navigation,
  sidebarTitle,
}: Pick<SidebarProps, 'closeSidebar' | 'navigation' | 'sidebarTitle'>) {
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
                      <NavigationItemWithChildren
                        closeSidebar={closeSidebar}
                        key={item.name}
                        {...item}
                      />
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
                        onClick={closeSidebar}
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

  const [sidebarOpen, setSidebarOpen] = useState(false);

  function closeSidebar() {
    setSidebarOpen(false);
  }

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
              closeSidebar={closeSidebar}
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
        <Header>
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
          {renderBackButton && <HeaderBackButton />}

          <HeaderSeperator className="lg:hidden" />

          {/* Header page title */}
          {headerTitle ? (
            <HeaderTitle
              className={cn(
                renderSearchBar && 'sr-only',
                !renderBackButton && 'lg:ml-2',
              )}
            >
              {headerTitle}
            </HeaderTitle>
          ) : (
            <div className="flex-1" />
          )}

          {renderSearchBar && <HeaderSearchBar />}

          <div className="flex items-center gap-x-2">
            {/* Notifications bell */}
            {typeof notifications === 'number' && (
              <HeaderNotificationsBell notifications={notifications} />
            )}

            <HeaderSeperator className="hidden lg:block" />

            {/* User profile dropdown */}
            <HeaderUserProfileDropdown {...userNavigation} />
          </div>
        </Header>

        <Outlet />
      </div>
    </div>
  );
}
