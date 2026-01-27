import { z } from 'zod';

export const userSchema = z.object({
  fullname: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  mobileNumber: z
    .string()
    .min(9, 'Mobile number must be between 9 to 13 digits')
    .max(13, 'Mobile number must be between 9 to 13 digits')
    .regex(/^\d{9,13}$/, 'Mobile number must be between 9 to 13 digits'),
  providerType: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'Province is required'),
  district: z.string().min(1, 'District is required'),
  constituency: z.string().min(1, 'Constituency is required'),
  ward: z.string().min(1, 'Ward is required'),
  facility: z.string().min(1, 'Facility is required'),
});
