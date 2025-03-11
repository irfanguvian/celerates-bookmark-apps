import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { categoryService } from '../services/CategoryService';
import { errorResponse, successResponse } from '../utils/apiResponses';

class CategoryController {
    async getAllCategories(c: Context) {
        try {
            const user = await c.get('user');
            const queryParam = c.req.query() as { limit?: number, offset?: number, search?: string };
            const categories = await categoryService.getAllCategories(user.id, queryParam);
            return successResponse(c, { categories }, 'Get Categoeries successfully');
        } catch (error) {
            return errorResponse(c, 'Error occurred', error);
        }
    }

    async createCategory(c: Context) {
        try {
            const user = await c.get('user')
            const body = await c.req.json();
            const newCategory = await categoryService.createCategory(user.id, body);
            return successResponse(c, { category: newCategory }, 'Created Categoery successfully');
        } catch (error) {
            return errorResponse(c, 'Error occurred', error);
        }
    }

    async updateCategory(c: Context) {
        try {
            const user = await c.get('user');
            const categoryId = c.req.param('id');
            const body = await c.req.json();

            const updatedCategory = await categoryService.updateCategory(user.id, categoryId, body);

            return successResponse(c, { category: updatedCategory }, 'updated Categoery successfully');
        } catch (error) {
            return errorResponse(c, 'Error occurred', error);
        }
    }

    async deleteCategory(c: Context) {
        try {
            const userId = await c.get('user').id;
            const categoryId = c.req.param('id');

            await categoryService.deleteCategory(userId, categoryId);

            return successResponse(c, {}, 'Delete Category successfully');
        } catch (error) {
            return errorResponse(c, 'Error occurred', error);
        }
    }
}

export const categoryController = new CategoryController();
