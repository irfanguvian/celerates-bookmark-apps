import { HTTPException } from "hono/http-exception";
import CategoryService from "../../services/CategoryService";
import { prismaMock } from "../singleton";

describe("CategoryService", () => {
	let categoryService: CategoryService;

	beforeEach(() => {
		categoryService = new CategoryService(prismaMock);
	});

	describe("getAllCategories", () => {
		it("should get all categories for a user with default params", async () => {
			// Arrange
			const userId = "user123";
			const queryParams = {};
			const categories = [
				{
					id: "category1",
					name: "Category 1",
					description: "First category",
					userId,
					createdAt: new Date(),
					updatedAt: new Date(),
					_count: { bookmarks: 3 },
				},
				{
					id: "category2",
					name: "Category 2",
					description: "Second category",
					userId,
					createdAt: new Date(),
					updatedAt: new Date(),
					_count: { bookmarks: 0 },
				},
			];

			prismaMock.category.findMany.mockResolvedValue(categories as any);

			// Act
			const result = await categoryService.getAllCategories(
				userId,
				queryParams,
			);

			// Assert
			expect(prismaMock.category.findMany).toHaveBeenCalledWith({
				where: { userId },
				include: {
					_count: {
						select: { bookmarks: true },
					},
				},
				skip: 0,
				take: 10,
				orderBy: { name: "asc" },
			});
			expect(result).toEqual(categories);
		});

		it("should get categories with search parameter", async () => {
			// Arrange
			const userId = "user123";
			const queryParams = { search: "test", limit: 5, offset: 10 };
			const categories = [
				{
					id: "category1",
					name: "Test Category",
					description: "Testing search",
					userId,
					createdAt: new Date(),
					updatedAt: new Date(),
					_count: { bookmarks: 1 },
				},
			];

			prismaMock.category.findMany.mockResolvedValue(categories as any);

			// Act
			const result = await categoryService.getAllCategories(
				userId,
				queryParams,
			);

			// Assert
			expect(prismaMock.category.findMany).toHaveBeenCalledWith({
				where: {
					userId,
					title: { contains: "test" },
				},
				include: {
					_count: {
						select: { bookmarks: true },
					},
				},
				skip: 10,
				take: 5,
				orderBy: { name: "asc" },
			});
			expect(result).toEqual(categories);
		});
	});

	describe("createCategory", () => {
		it("should create a category successfully", async () => {
			// Arrange
			const userId = "user123";
			const categoryData = {
				name: "New Category",
				description: "New category description",
			};

			const createdCategory = {
				id: "category1",
				...categoryData,
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			prismaMock.category.findFirst.mockResolvedValue(null);
			prismaMock.category.create.mockResolvedValue(createdCategory as any);

			// Act
			const result = await categoryService.createCategory(userId, categoryData);

			// Assert
			expect(prismaMock.category.findFirst).toHaveBeenCalledWith({
				where: {
					name: categoryData.name,
					userId,
				},
			});
			expect(prismaMock.category.create).toHaveBeenCalledWith({
				data: {
					name: categoryData.name,
					description: categoryData.description,
					user: {
						connect: { id: userId },
					},
				},
			});
			expect(result).toEqual(createdCategory);
		});

		it("should throw error if category name already exists for user", async () => {
			// Arrange
			const userId = "user123";
			const categoryData = {
				name: "Existing Category",
				description: "New description",
			};

			const existingCategory = {
				id: "category1",
				name: categoryData.name,
				description: "Existing description",
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			prismaMock.category.findFirst.mockResolvedValue(existingCategory as any);

			// Act & Assert
			await expect(
				categoryService.createCategory(userId, categoryData),
			).rejects.toThrow(HTTPException);

			expect(prismaMock.category.findFirst).toHaveBeenCalledWith({
				where: {
					name: categoryData.name,
					userId,
				},
			});
			expect(prismaMock.category.create).not.toHaveBeenCalled();
		});
	});

	describe("updateCategory", () => {
		it("should update category fields successfully", async () => {
			// Arrange
			const userId = "user123";
			const categoryId = "category1";
			const updateData = {
				name: "Updated Category",
				description: "Updated description",
			};

			const existingCategory = {
				id: categoryId,
				name: "Original Name",
				description: "Original description",
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const updatedCategory = {
				...existingCategory,
				...updateData,
				updatedAt: new Date(),
			};

			prismaMock.category.findFirst.mockResolvedValue(existingCategory as any);
			prismaMock.category.findFirst.mockResolvedValueOnce(
				existingCategory as any,
			);
			prismaMock.category.findFirst.mockResolvedValueOnce(null); // No duplicate name
			prismaMock.category.update.mockResolvedValue(updatedCategory as any);

			// Act
			const result = await categoryService.updateCategory(
				userId,
				categoryId,
				updateData,
			);

			// Assert
			expect(prismaMock.category.findFirst).toHaveBeenCalledWith({
				where: {
					id: categoryId,
					userId,
				},
			});
			expect(prismaMock.category.findFirst).toHaveBeenCalledWith({
				where: {
					name: updateData.name,
					userId,
					id: { not: categoryId },
				},
			});
			expect(prismaMock.category.update).toHaveBeenCalledWith({
				where: { id: categoryId },
				data: {
					name: updateData.name,
					description: updateData.description,
				},
			});
			expect(result).toEqual(updatedCategory);
		});

		it("should update only description if name is unchanged", async () => {
			// Arrange
			const userId = "user123";
			const categoryId = "category1";
			const existingName = "Category Name";
			const updateData = {
				name: existingName,
				description: "Updated description",
			};

			const existingCategory = {
				id: categoryId,
				name: existingName,
				description: "Original description",
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const updatedCategory = {
				...existingCategory,
				description: updateData.description,
				updatedAt: new Date(),
			};

			prismaMock.category.findFirst.mockResolvedValue(existingCategory as any);
			prismaMock.category.update.mockResolvedValue(updatedCategory as any);

			// Act
			const result = await categoryService.updateCategory(
				userId,
				categoryId,
				updateData,
			);

			// Assert
			expect(prismaMock.category.findFirst).toHaveBeenCalledWith({
				where: {
					id: categoryId,
					userId,
				},
			});
			// Should not check for duplicate names if name hasn't changed
			expect(prismaMock.category.update).toHaveBeenCalledWith({
				where: { id: categoryId },
				data: {
					description: updateData.description,
					name: updateData.name,
				},
			});
			expect(result).toEqual(updatedCategory);
		});

		it("should throw error if category not found", async () => {
			// Arrange
			const userId = "user123";
			const categoryId = "nonexistent";
			const updateData = {
				name: "Updated Category",
			};

			prismaMock.category.findFirst.mockResolvedValue(null);

			// Act & Assert
			await expect(
				categoryService.updateCategory(userId, categoryId, updateData),
			).rejects.toThrow(HTTPException);

			expect(prismaMock.category.findFirst).toHaveBeenCalledWith({
				where: {
					id: categoryId,
					userId,
				},
			});
			expect(prismaMock.category.update).not.toHaveBeenCalled();
		});

		it("should throw error if updated name would create a duplicate", async () => {
			// Arrange
			const userId = "user123";
			const categoryId = "category1";
			const updateData = {
				name: "Duplicate Name",
			};

			const existingCategory = {
				id: categoryId,
				name: "Original Name",
				description: "Original description",
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const duplicateCategory = {
				id: "category2",
				name: "Duplicate Name",
				description: "Another category",
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// First findFirst is for finding the category to update
			prismaMock.category.findFirst.mockResolvedValueOnce(
				existingCategory as any,
			);
			// Second findFirst is for checking duplicate names
			prismaMock.category.findFirst.mockResolvedValueOnce(
				duplicateCategory as any,
			);

			// Act & Assert
			await expect(
				categoryService.updateCategory(userId, categoryId, updateData),
			).rejects.toThrow(HTTPException);

			expect(prismaMock.category.update).not.toHaveBeenCalled();
		});
	});

	describe("deleteCategory", () => {
		it("should delete a category successfully", async () => {
			// Arrange
			const userId = "user123";
			const categoryId = "category1";

			const category = {
				id: categoryId,
				name: "Category to Delete",
				description: "Description",
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
				_count: { bookmarks: 0 },
			};

			prismaMock.category.findFirst.mockResolvedValue(category as any);
			prismaMock.category.delete.mockResolvedValue(category as any);

			// Act
			const result = await categoryService.deleteCategory(userId, categoryId);

			// Assert
			expect(prismaMock.category.findFirst).toHaveBeenCalledWith({
				where: {
					id: categoryId,
					userId,
				},
				include: {
					_count: {
						select: { bookmarks: true },
					},
				},
			});
			expect(prismaMock.category.delete).toHaveBeenCalledWith({
				where: { id: categoryId },
			});
			expect(result).toBe(true);
		});

		it("should throw error if category not found", async () => {
			// Arrange
			const userId = "user123";
			const categoryId = "nonexistent";

			prismaMock.category.findFirst.mockResolvedValue(null);

			// Act & Assert
			await expect(
				categoryService.deleteCategory(userId, categoryId),
			).rejects.toThrow(HTTPException);

			expect(prismaMock.category.delete).not.toHaveBeenCalled();
		});
	});
});
