import { z } from 'zod'

export const pushupSchema = z.object({
    count: z
        .number()
        .int()
        .min(1, "You can't log less than 1 pushup")
        .max(1000, "That's too many pushups at once!"),
    submissionTime: z.string().datetime(),
})

export type PushupInput = z.infer<typeof pushupSchema>
