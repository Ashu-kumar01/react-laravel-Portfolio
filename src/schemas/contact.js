import { z } from 'zod'

/** Mirrors App\Http\Requests\ContactRequest so users get instant feedback. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120, 'Name is too long.'),
  email: z.string().trim().min(1, 'Please enter your email.').email('Please enter a valid email address.').max(190),
  phone: z
    .string()
    .trim()
    .max(20, 'Phone number is too long.')
    .refine((v) => v === '' || /^\+?[0-9\s\-()]{7,20}$/.test(v), 'Please enter a valid phone number.')
    .optional()
    .or(z.literal('')),
  subject: z.string().trim().min(3, 'Please add a short subject.').max(190, 'Subject is too long.'),
  message: z.string().trim().min(10, 'Please write at least 10 characters.').max(5000, 'Message is too long (max 5000 characters).'),
  website: z.string().optional(), // honeypot
})

export const contactDefaults = { name: '', email: '', phone: '', subject: '', message: '', website: '' }
