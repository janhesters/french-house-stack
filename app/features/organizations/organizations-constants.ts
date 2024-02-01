export const ORGANIZATION_MEMBERSHIP_ROLES = {
  MEMBER: 'member',
  ADMIN: 'admin',
  OWNER: 'owner',
} as const;

export type OrganizationMembershipRole =
  (typeof ORGANIZATION_MEMBERSHIP_ROLES)[keyof typeof ORGANIZATION_MEMBERSHIP_ROLES];
