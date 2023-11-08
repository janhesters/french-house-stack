import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z
    .string({ invalid_type_error: 'login:email-must-be-string' })
    .min(1, 'login:email-required')
    .email('login:email-invalid'),
  intent: z.literal('emailLogin'),
});

export const registrationFormSchema = z.object({
  acceptedTerms: z
    .preprocess(value => value === 'true' || value === true, z.boolean())
    .refine(value => value === true, {
      message: 'register:terms-must-be-accepted',
    }),
  email: z
    .string({ invalid_type_error: 'register:email-must-be-string' })
    .min(1, 'register:email-required')
    .email('register:email-invalid'),
  intent: z.literal('emailRegistration'),
});
