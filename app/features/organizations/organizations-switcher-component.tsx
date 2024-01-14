import { Link } from '@remix-run/react';
import { CommandList } from 'cmdk';
import { CheckIcon, ChevronsUpDownIcon, PlusCircleIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '~/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { cn } from '~/utils/shadcn-ui';

import { useTranslation } from '../localization/use-translation';

export type OrganizationsSwitcherComponentProps = {
  organizations: Array<{ isCurrent: boolean; name: string; slug: string }>;
};

export function OrganizationsSwitcherComponent({
  organizations,
}: OrganizationsSwitcherComponentProps) {
  const { t } = useTranslation('organizations');
  const [open, setOpen] = useState(false);
  const currentOrganization = organizations.find(({ isCurrent }) => isCurrent);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-label={t('select-an-organization')}
          className="w-full"
          role="combobox"
          variant="outline"
        >
          {currentOrganization?.name}

          <ChevronsUpDownIcon
            aria-hidden="true"
            className="ml-auto size-4 shrink-0 opacity-50"
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="ml-0.5 w-66 p-0 sm:w-82 lg:ml-0 lg:w-68">
        <Command>
          <CommandList>
            <CommandGroup heading={t('organizations')}>
              {organizations.map(({ isCurrent, name, slug }) => (
                <CommandItem
                  aria-current={isCurrent ? 'page' : undefined}
                  className="text-sm"
                  key={slug}
                  onSelect={() => {
                    setOpen(false);
                  }}
                >
                  <Link
                    className="flex w-full items-center justify-between"
                    to={`/organizations/${slug}/home`}
                  >
                    {name}

                    <CheckIcon
                      aria-hidden="true"
                      className={cn(
                        'ml-auto size-4',
                        isCurrent ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </Link>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

          <CommandSeparator />

          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                }}
              >
                <Link className="flex w-full" to="/organizations/new">
                  <PlusCircleIcon className="mr-2 size-5" />

                  {t('create-organization')}
                </Link>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
