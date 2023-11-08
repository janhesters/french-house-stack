import { z } from 'zod';

export const onboardingUserProfileSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'onboarding-user-profile:name-must-be-string',
    })
    .trim()
    .min(2, 'onboarding-user-profile:name-min-length')
    .max(128, 'onboarding-user-profile:name-max-length'),
  intent: z.literal('create'),
});

export const onboardingOrganizationSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'onboarding-organization:name-must-be-string',
    })
    .trim()
    .min(3, 'onboarding-organization:name-min-length')
    .max(255, 'onboarding-organization:name-max-length'),
  intent: z.literal('create'),
});
