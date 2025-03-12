import { zValidator } from '@hono/zod-validator';
import CategoryController from '../controllers/CategoryController';
import { OpenAPIHono } from '@hono/zod-openapi';
import { createCategorySchema, updateCategorySchema } from '../schemas/categorySchemas';
import { MiddlewareHandler } from 'hono';


export function categoryRouteHandler(
    categoryController: CategoryController,
    authMiddleware: MiddlewareHandler
) {
    const categoryRouter = new OpenAPIHono();

    categoryRouter.use('*', authMiddleware);
    // GET /categories - List all categories
    categoryRouter.get('/', async (c) => categoryController.getAllCategories(c));


    // POST /categories - Create a new category
    categoryRouter.post('/', zValidator('json', createCategorySchema), async (c) => categoryController.createCategory(c));

    // PUT /categories/:id - Update a category
    categoryRouter.put('/:id', zValidator('json', updateCategorySchema), async (c) => categoryController.updateCategory(c));

    // DELETE /categories/:id - Delete a category
    categoryRouter.delete('/:id', async (c) => categoryController.deleteCategory(c));

    return categoryRouter
}
