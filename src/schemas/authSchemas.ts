import { z } from '@hono/zod-openapi';

// Schema for creating a category
const createUserSchema = z.object({
    email: z.string().min(1, 'email is required'),
    firstName: z.string().min(1, 'firstName is required'),
    lastName: z.string().min(1, 'lastName is required'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    retypePassword: z.string().min(8, 'Password must be at least 8 characters long'),
}).refine(data => data.password === data.retypePassword, {
    message: 'Passwords do not match'
});

// Schema for updating a category
const loginSchema = z.object({
    email: z.string().min(1, 'email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
});


export {
    createUserSchema,
    loginSchema
}