import { z } from 'zod';

export const newOrganizationSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'organizations-new:name-must-be-string',
    })
    .trim()
    .min(3, 'organizations-new:name-min-length')
    .max(255, 'organizations-new:name-max-length'),
  intent: z.literal('create'),
});

export const organizationProfileSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'organization-profile:name-must-be-string',
    })
    .trim()
    .min(3, 'organization-profile:name-min-length')
    .max(255, 'organization-profile:name-max-length'),
  intent: z.literal('update'),
});
