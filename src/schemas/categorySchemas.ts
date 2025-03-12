import { z } from "@hono/zod-openapi";

// Schema for creating a category
const createCategorySchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
});

// Schema for updating a category
const updateCategorySchema = z
	.object({
		name: z.string().min(1).optional(),
		description: z.string().optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field must be provided for update",
	});

export { createCategorySchema, updateCategorySchema };
