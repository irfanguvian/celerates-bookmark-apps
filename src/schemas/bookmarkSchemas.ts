import { z } from "@hono/zod-openapi";

const createBookmarkSchema = z.object({
	title: z.string().min(1, "Title is required").max(255),
	description: z.string().optional(),
	categoryId: z.string().uuid().optional(),
	tags: z.array(z.string()).optional(),
});

// Schema for updating a category
const updateBookmarkSchema = z
	.object({
		title: z.string().min(1, "Title is required").max(255),
		description: z.string().optional(),
		categoryId: z.string().uuid().optional(),
		tags: z.array(z.string()).optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field must be provided for update",
	});

export { createBookmarkSchema, updateBookmarkSchema };
