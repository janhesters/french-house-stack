import { z } from 'zod';

export const settingsUserProfileSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'settings-user-profile:name-must-be-string',
    })
    .trim()
    .min(2, 'settings-user-profile:name-min-length')
    .max(128, 'settings-user-profile:name-max-length'),
  intent: z.literal('update'),
});

export const settingsAccountSchema = z.object({ intent: z.literal('delete') });
