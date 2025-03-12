import { Context } from "hono";
import CategoryController from "../../controllers/CategoryController";
import { ICategoryService } from "../../entities/CategoryService.entities";
import CategoryService from "../../services/CategoryService";
import { errorResponse, successResponse } from "../../utils/apiResponses";
import { prismaMock } from "../singleton";

// Mock dependencies
jest.mock("../../services/CategoryService");
jest.mock("../../utils/apiResponses");

describe("CategoryController", () => {
	let mockContext: Partial<Context>;
	let mockReq: { json: jest.Mock; query: jest.Mock; param: jest.Mock };
	let categoryController: CategoryController;
	let categoryService: ICategoryService;

	beforeEach(() => {
		// Reset mocks
		jest.clearAllMocks();

		// Mock context and request
		mockReq = {
			json: jest.fn(),
			query: jest.fn(),
			param: jest.fn(),
		};
		mockContext = {
			req: mockReq as any,
			get: jest.fn().mockImplementation((key) => {
				if (key === "user") return { id: "user123", email: "test@example.com" };
				return null;
			}),
		};

		(successResponse as jest.Mock).mockReturnValue("success");
		(errorResponse as jest.Mock).mockReturnValue("error");

		categoryService = new CategoryService(prismaMock);
		categoryController = new CategoryController(categoryService);
	});

	describe("getAllCategories", () => {
		it("should successfully get all categories", async () => {
			// Arrange
			const queryParams = { limit: 10, offset: 0, search: "test" };
			const serviceResponse = [
				{ id: "category1", name: "Test Category 1" },
				{ id: "category2", name: "Test Category 2" },
			];

			mockReq.query.mockReturnValue(queryParams);
			(categoryService.getAllCategories as jest.Mock).mockResolvedValue(
				serviceResponse,
			);

			// Act
			const result = await categoryController.getAllCategories(
				mockContext as Context,
			);

			// Assert
			expect(categoryService.getAllCategories).toHaveBeenCalledWith(
				"user123",
				queryParams,
			);
			expect(successResponse).toHaveBeenCalledWith(
				mockContext,
				{ categories: serviceResponse },
				"Get Categoeries successfully",
			);
			expect(result).toBe("success");
		});

		it("should handle errors when getting all categories", async () => {
			// Arrange
			const error = new Error("Database error");

			mockReq.query.mockReturnValue({});
			(categoryService.getAllCategories as jest.Mock).mockRejectedValue(error);

			// Act
			const result = await categoryController.getAllCategories(
				mockContext as Context,
			);

			// Assert
			expect(errorResponse).toHaveBeenCalledWith(
				mockContext,
				"Error occurred",
				error,
			);
			expect(result).toBe("error");
		});
	});

	describe("createCategory", () => {
		it("should successfully create a category", async () => {
			// Arrange
			const categoryData = {
				name: "New Category",
				description: "Test description",
			};
			const serviceResponse = { id: "category1", ...categoryData };

			mockReq.json.mockResolvedValue(categoryData);
			(categoryService.createCategory as jest.Mock).mockResolvedValue(
				serviceResponse,
			);

			// Act
			const result = await categoryController.createCategory(
				mockContext as Context,
			);

			// Assert
			expect(categoryService.createCategory).toHaveBeenCalledWith(
				"user123",
				categoryData,
			);
			expect(successResponse).toHaveBeenCalledWith(
				mockContext,
				{ category: serviceResponse },
				"Created Categoery successfully",
			);
			expect(result).toBe("success");
		});

		it("should handle errors when creating a category", async () => {
			// Arrange
			const categoryData = { name: "" };
			const error = new Error("Validation error");

			mockReq.json.mockResolvedValue(categoryData);
			(categoryService.createCategory as jest.Mock).mockRejectedValue(error);

			// Act
			const result = await categoryController.createCategory(
				mockContext as Context,
			);

			// Assert
			expect(errorResponse).toHaveBeenCalledWith(
				mockContext,
				"Error occurred",
				error,
			);
			expect(result).toBe("error");
		});
	});

	describe("updateCategory", () => {
		it("should successfully update a category", async () => {
			// Arrange
			const categoryId = "category1";
			const updateData = { name: "Updated Category" };
			const serviceResponse = {
				id: categoryId,
				...updateData,
				description: "Test description",
			};

			mockReq.param.mockReturnValue(categoryId);
			mockReq.json.mockResolvedValue(updateData);
			(categoryService.updateCategory as jest.Mock).mockResolvedValue(
				serviceResponse,
			);

			// Act
			const result = await categoryController.updateCategory(
				mockContext as Context,
			);

			// Assert
			expect(categoryService.updateCategory).toHaveBeenCalledWith(
				"user123",
				categoryId,
				updateData,
			);
			expect(successResponse).toHaveBeenCalledWith(
				mockContext,
				{ category: serviceResponse },
				"updated Categoery successfully",
			);
			expect(result).toBe("success");
		});

		it("should handle errors when updating a category", async () => {
			// Arrange
			const categoryId = "category1";
			const updateData = { name: "" };
			const error = new Error("Update failed");

			mockReq.param.mockReturnValue(categoryId);
			mockReq.json.mockResolvedValue(updateData);
			(categoryService.updateCategory as jest.Mock).mockRejectedValue(error);

			// Act
			const result = await categoryController.updateCategory(
				mockContext as Context,
			);

			// Assert
			expect(errorResponse).toHaveBeenCalledWith(
				mockContext,
				"Error occurred",
				error,
			);
			expect(result).toBe("error");
		});
	});

	describe("deleteCategory", () => {
		it("should successfully delete a category", async () => {
			// Arrange
			const categoryId = "category1";

			mockReq.param.mockReturnValue(categoryId);
			(categoryService.deleteCategory as jest.Mock).mockResolvedValue(
				undefined,
			);

			// Act
			const result = await categoryController.deleteCategory(
				mockContext as Context,
			);

			// Assert
			expect(categoryService.deleteCategory).toHaveBeenCalledWith(
				"user123",
				categoryId,
			);
			expect(successResponse).toHaveBeenCalledWith(
				mockContext,
				{},
				"Delete Category successfully",
			);
			expect(result).toBe("success");
		});

		it("should handle errors when deleting a category", async () => {
			// Arrange
			const categoryId = "category1";
			const error = new Error("Delete failed");

			mockReq.param.mockReturnValue(categoryId);
			(categoryService.deleteCategory as jest.Mock).mockRejectedValue(error);

			// Act
			const result = await categoryController.deleteCategory(
				mockContext as Context,
			);

			// Assert
			expect(errorResponse).toHaveBeenCalledWith(
				mockContext,
				"Error occurred",
				error,
			);
			expect(result).toBe("error");
		});
	});
});
