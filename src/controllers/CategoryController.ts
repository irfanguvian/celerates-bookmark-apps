import { Context } from 'hono';
import { errorResponse, successResponse } from '../utils/apiResponses';
import { ICategoryService } from '../entities/CategoryService';

class CategoryController {
    categoryService: ICategoryService
    constructor(categoryService: ICategoryService) {
        this.categoryService = categoryService;
    }
    async getAllCategories(c: Context) {
        try {
            const user = await c.get('user');
            const queryParam = c.req.query() as { limit?: number, offset?: number, search?: string };
            const categories = await this.categoryService.getAllCategories(user.id, queryParam);
            return successResponse(c, { categories }, 'Get Categoeries successfully');
        } catch (error) {
            return errorResponse(c, 'Error occurred', error);
        }
    }

    async createCategory(c: Context) {
        try {
            const user = await c.get('user')
            const body = await c.req.json();
            const newCategory = await this.categoryService.createCategory(user.id, body);
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

            const updatedCategory = await this.categoryService.updateCategory(user.id, categoryId, body);

            return successResponse(c, { category: updatedCategory }, 'updated Categoery successfully');
        } catch (error) {
            return errorResponse(c, 'Error occurred', error);
        }
    }

    async deleteCategory(c: Context) {
        try {
            const userId = await c.get('user').id;
            const categoryId = c.req.param('id');

            await this.categoryService.deleteCategory(userId, categoryId);

            return successResponse(c, {}, 'Delete Category successfully');
        } catch (error) {
            return errorResponse(c, 'Error occurred', error);
        }
    }
}

export default CategoryController
