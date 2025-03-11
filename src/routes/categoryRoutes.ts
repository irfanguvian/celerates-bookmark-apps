import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { categoryController } from '../controllers/CategoryController';
import { authMiddleware } from '../middleware/authMiddleware';
import { OpenAPIHono } from '@hono/zod-openapi';
import { createCategorySchema, updateCategorySchema } from '../schemas/categorySchemas';

const categoryRouter = new OpenAPIHono();

categoryRouter.use('*', authMiddleware());
// GET /categories - List all categories
categoryRouter.get('/', async (c) => categoryController.getAllCategories(c));


// POST /categories - Create a new category
categoryRouter.post('/', zValidator('json', createCategorySchema), async (c) => categoryController.createCategory(c));

// PUT /categories/:id - Update a category
categoryRouter.put('/:id', zValidator('json', updateCategorySchema), async (c) => categoryController.updateCategory(c));

// DELETE /categories/:id - Delete a category
categoryRouter.delete('/:id', async (c) => categoryController.deleteCategory(c));

export default categoryRouter;
