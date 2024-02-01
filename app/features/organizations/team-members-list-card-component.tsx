import type { Membership, UserProfile } from '@prisma/client';
import { useFetcher } from '@remix-run/react';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

import type { CardPaginationProps } from '~/components/card-pagination';
import { CardPagination } from '~/components/card-pagination';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '~/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';

import { useTranslation } from '../localization/use-translation';

export type TeamMember = Pick<UserProfile, 'email' | 'id' | 'name'> &
  Pick<Membership, 'role' | 'deactivatedAt'>;

function RoleSwitcher({ member }: { member: TeamMember }) {
  const { t } = useTranslation('organization-team-members');
  const [open, setOpen] = useState(false);
  const fetcher = useFetcher();
  const role =
    (fetcher.formData?.get('role') as string) ||
    (member.deactivatedAt ? 'deactivated' : member.role);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="ml-auto" size="sm" variant="outline">
          {t(role)}

          <ChevronDownIcon
            aria-hidden="true"
            className="ml-2 h-4 w-4 text-muted-foreground"
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent asChild align="end" className="p-0">
        <fetcher.Form
          method="POST"
          onSubmit={() => {
            setOpen(false);
          }}
        >
          <input name="userId" value={member.id} type="hidden" />
          <input name="intent" value="changeRole" type="hidden" />

          <Command>
            <CommandInput placeholder={t('roles-placeholder')} />

            <CommandList>
              <CommandEmpty>{t('no-roles-found')}</CommandEmpty>

              <CommandGroup>
                <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                  <button
                    className="text-start"
                    name="role"
                    value="member"
                    type="submit"
                  >
                    <p>{t('member')}</p>

                    <p className="text-sm text-muted-foreground">
                      {t('member-description')}
                    </p>
                  </button>
                </CommandItem>

                <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                  <button
                    className="text-start"
                    name="role"
                    value="admin"
                    type="submit"
                  >
                    <p>{t('admin')}</p>

                    <p className="text-sm text-muted-foreground">
                      {t('admin-description')}
                    </p>
                  </button>
                </CommandItem>

                <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                  <button
                    className="text-start"
                    name="role"
                    value="owner"
                    type="submit"
                  >
                    <p>{t('owner')}</p>

                    <p className="text-sm text-muted-foreground">
                      {t('owner-description')}
                    </p>
                  </button>
                </CommandItem>

                <CommandSeparator />

                <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                  <button
                    className="text-start"
                    name="role"
                    value="deactivated"
                    type="submit"
                  >
                    <p>{t('deactivated')}</p>

                    <p className="text-sm text-muted-foreground">
                      {t('deactivated-description')}
                    </p>
                  </button>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </fetcher.Form>
      </PopoverContent>
    </Popover>
  );
}

export type TeamMembersListCardComponentProps = {
  currentUserIsOwner: boolean;
  currentUsersId: string;
  teamMembers: TeamMember[];
} & Omit<CardPaginationProps, 'className'>;

export function TeamMembersListCardComponent({
  currentPage,
  currentUserIsOwner,
  currentUsersId,
  perPage,
  teamMembers,
  totalItemCount,
}: TeamMembersListCardComponentProps) {
  const { t } = useTranslation('organization-team-members');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('card-title-members-list')}</CardTitle>
      </CardHeader>

      <CardContent>
        <ul aria-label={t('team-members')} className="grid gap-6">
          {teamMembers.map(member => (
            <li
              className="flex items-center justify-between space-x-4"
              key={member.email}
            >
              <div className="flex items-center space-x-4">
                <div>
                  <p className="max-w-44 text-sm font-medium leading-none">
                    {member.name}
                  </p>

                  <p className="max-w-44 truncate text-sm text-muted-foreground xs:max-w-56 xl:max-w-none">
                    {member.email}
                  </p>
                </div>
              </div>

              {currentUserIsOwner && member.id !== currentUsersId ? (
                <RoleSwitcher member={member} />
              ) : (
                <div className="ml-auto">
                  <p className="text-sm text-muted-foreground">
                    {member.deactivatedAt ? t('deactivated') : t(member.role)}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <CardPagination
          className="w-full"
          currentPage={currentPage}
          perPage={perPage}
          totalItemCount={totalItemCount}
        />
      </CardFooter>
    </Card>
  );
}
