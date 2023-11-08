export const ORGANIZATION_MEMBERSHIP_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export type OrganizationMembershipRole =
  (typeof ORGANIZATION_MEMBERSHIP_ROLES)[keyof typeof ORGANIZATION_MEMBERSHIP_ROLES];
