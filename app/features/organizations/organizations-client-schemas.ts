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
