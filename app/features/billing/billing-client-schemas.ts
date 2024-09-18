import { z } from 'zod';

export const contactSalesFormSchema = z.object({
  firstName: z
    .string({ invalid_type_error: 'contact-sales:first-name-must-be-string' })
    .min(1, 'contact-sales:first-name-required')
    .max(255, 'contact-sales:first-name-too-long'),
  lastName: z
    .string({ invalid_type_error: 'contact-sales:last-name-must-be-string' })
    .min(1, 'contact-sales:last-name-required')
    .max(255, 'contact-sales:last-name-too-long'),
  companyName: z
    .string({ invalid_type_error: 'contact-sales:company-name-must-be-string' })
    .min(1, 'contact-sales:company-name-required')
    .max(255, 'contact-sales:company-name-too-long'),
  workEmail: z
    .string({ invalid_type_error: 'contact-sales:work-email-must-be-string' })
    .min(1, 'contact-sales:work-email-required')
    .email('contact-sales:work-email-invalid'),
  phoneNumber: z
    .string({ invalid_type_error: 'contact-sales:phone-number-must-be-string' })
    .min(1, 'contact-sales:phone-number-required'),
  message: z
    .string({ invalid_type_error: 'contact-sales:message-must-be-string' })
    .min(1, 'contact-sales:message-required')
    .max(5000, 'contact-sales:message-too-long'),
  intent: z.literal('contactSales'),
});
