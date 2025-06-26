import z from 'zod'

export const SignUpFormSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    name: z.string().optional()
})