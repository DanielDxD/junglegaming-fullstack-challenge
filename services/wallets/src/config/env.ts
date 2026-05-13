import z from "zod";

const EnvSchema = z.object({
    PORT: z.coerce.number(),
    DATABASE_URL: z.url(),
    RABBITMQ_URL: z.url()
})

export const env = EnvSchema.parse(process.env);