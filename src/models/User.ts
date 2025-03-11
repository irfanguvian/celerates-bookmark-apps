import { z } from 'zod'

// User schema for validation
export const UserSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name cannot be empty"),
    email: z.string().email("Invalid email format"),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional()
})

// Derive TypeScript type from Zod schema
export type User = z.infer<typeof UserSchema>

export type UserCreateInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>
export type UserUpdateInput = Partial<UserCreateInput>
