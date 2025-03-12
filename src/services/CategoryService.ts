import { HTTPException } from 'hono/http-exception';
import { CategoryCreateInput, CategoryUpdateInput, ICategoryService } from '../entities/CategoryService';
import { PrismaClient } from '@prisma/client';

class CategoryService implements ICategoryService {
    prisma: PrismaClient
    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }
    async getAllCategories(userId: string, queryParam: { limit?: number, offset?: number, search?: string }) {
        const { limit = 10, offset = 0, search = '' } = queryParam;
        const whereParam = {
            userId: userId
        } as { userId: string, title?: { contains: string } };

        if (search && search != "") {
            whereParam.title = { contains: `${search}` };
        }


        return this.prisma.category.findMany({
            where: whereParam,
            include: {
                _count: {
                    select: { bookmarks: true }
                }
            },
            skip: +offset,
            take: +limit,
            orderBy: { name: 'asc' }
        });
    }

    async createCategory(userId: string, data: CategoryCreateInput) {
        // Check if category with the same name already exists for this user
        const existingCategory = await this.prisma.category.findFirst({
            where: {
                name: data.name,
                userId
            }
        });

        if (existingCategory) {
            throw new HTTPException(409, { message: 'A category with this name already exists' });
        }

        return this.prisma.category.create({
            data: {
                name: data.name,
                description: data.description,
                user: {
                    connect: { id: userId }
                }
            }
        });
    }

    async updateCategory(userId: string, categoryId: string, data: CategoryUpdateInput) {
        // Check if category exists and belongs to user
        const existingCategory = await this.prisma.category.findFirst({
            where: {
                id: categoryId,
                userId
            }
        });

        if (!existingCategory) {
            throw new HTTPException(400, { message: 'Category not found' });
        }

        // If name is being updated, check for duplicates
        if (data.name && data.name !== existingCategory.name) {
            const duplicateName = await this.prisma.category.findFirst({
                where: {
                    name: data.name,
                    userId,
                    id: { not: categoryId }
                }
            });

            if (duplicateName) {
                throw new HTTPException(400, { message: 'A category with this name already exists' });
            }
        }

        return this.prisma.category.update({
            where: { id: categoryId },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.description !== undefined && { description: data.description })
            }
        });
    }

    async deleteCategory(userId: string, categoryId: string) {
        // Check if category exists and belongs to user
        const category = await this.prisma.category.findFirst({
            where: {
                id: categoryId,
                userId
            },
            include: {
                _count: {
                    select: { bookmarks: true }
                }
            }
        });

        if (!category) {
            throw new HTTPException(400, { message: 'Category not found' });
        }

        // Delete the category
        // Note: Make sure your database schema has proper cascading deletes or
        // you'll need to handle bookmarks with this category first
        await this.prisma.category.delete({
            where: { id: categoryId }
        });

        return true;
    }
}

export default CategoryService
