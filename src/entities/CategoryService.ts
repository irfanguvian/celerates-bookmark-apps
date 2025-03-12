import { Category } from "@prisma/client";

export type CategoryCreateInput = {
    name: string;
    description?: string;
}

export type CategoryUpdateInput = {
    name?: string;
    description?: string;
}
type QueryParamCategoryFilter = { limit?: number, offset?: number, search?: string }

export interface ICategoryService {
    getAllCategories(userId: string, queryParam: QueryParamCategoryFilter): Promise<Category[]>;
    createCategory(userId: string, data: CategoryCreateInput): Promise<Category>;
    updateCategory(userId: string, categoryId: string, data: CategoryUpdateInput): Promise<Category>;
    deleteCategory(userId: string, categoryId: string): Promise<boolean>;
}