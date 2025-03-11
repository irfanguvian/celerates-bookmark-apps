import { z } from 'zod';

export const BookmarkCreateSchema = z.object({
    title: z.string().min(1, "Title is required"),
    url: z.string().url("Invalid URL format"),
    description: z.string().optional(),
    imageUrl: z.string().url("Invalid image URL").optional(),
    categoryId: z.string().optional(),
    tags: z.array(z.string()).default([])
});

export type BookmarkCreateInput = z.infer<typeof BookmarkCreateSchema>;
