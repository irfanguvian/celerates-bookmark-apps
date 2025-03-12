import { HTTPException } from "hono/http-exception";
import BookmarkService from "../../services/BookmarkService";
import { prismaMock } from "../singleton";

describe("BookmarkService", () => {
	let bookmarkService: BookmarkService;

	beforeEach(() => {
		bookmarkService = new BookmarkService(prismaMock);
	});

	describe("getAllBookmarks", () => {
		it("should get all bookmarks for a user with default params", async () => {
			// Arrange
			const userId = "user123";
			const queryParams = {};
			const bookmarks = [
				{
					id: "bookmark1",
					title: "Bookmark 1",
					description: "First bookmark",
					userId,
					categoryId: "category1",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "bookmark2",
					title: "Bookmark 2",
					description: "Second bookmark",
					userId,
					categoryId: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			prismaMock.bookmark.findMany.mockResolvedValue(bookmarks as any);

			// Act
			const result = await bookmarkService.getAllBookmarks(userId, queryParams);

			// Assert
			expect(prismaMock.bookmark.findMany).toHaveBeenCalledWith({
				where: { userId },
				include: {
					category: true,
					tags: {
						include: {
							tag: true,
						},
					},
				},
				skip: 0,
				take: 10,
				orderBy: { updatedAt: "desc" },
			});
			expect(result).toEqual(bookmarks);
		});

		it("should get bookmarks with search parameter", async () => {
			// Arrange
			const userId = "user123";
			const queryParams = { search: "test", limit: 5, offset: 10 };
			const bookmarks = [
				{
					id: "bookmark1",
					title: "Test Bookmark",
					description: "Testing search",
					userId,
					categoryId: "category1",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			prismaMock.bookmark.findMany.mockResolvedValue(bookmarks as any);

			// Act
			const result = await bookmarkService.getAllBookmarks(userId, queryParams);

			// Assert
			expect(prismaMock.bookmark.findMany).toHaveBeenCalledWith({
				where: {
					userId,
					title: { contains: "test" },
				},
				include: {
					category: true,
					tags: {
						include: {
							tag: true,
						},
					},
				},
				skip: 10,
				take: 5,
				orderBy: { updatedAt: "desc" },
			});
			expect(result).toEqual(bookmarks);
		});

		it("should filter bookmarks by categoryId", async () => {
			// Arrange
			const userId = "user123";
			const categoryId = "category1";
			const queryParams = { categoryId };
			const bookmarks = [
				{
					id: "bookmark1",
					title: "Bookmark 1",
					description: "First bookmark",
					userId,
					categoryId,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			prismaMock.bookmark.findMany.mockResolvedValue(bookmarks as any);

			// Act
			const result = await bookmarkService.getAllBookmarks(userId, queryParams);

			// Assert
			expect(prismaMock.bookmark.findMany).toHaveBeenCalledWith({
				where: {
					userId,
					categoryId,
				},
				include: {
					category: true,
					tags: {
						include: {
							tag: true,
						},
					},
				},
				skip: 0,
				take: 10,
				orderBy: { updatedAt: "desc" },
			});
			expect(result).toEqual(bookmarks);
		});
	});

	describe("createBookmark", () => {
		it("should create a bookmark without category or tags", async () => {
			// Arrange
			const userId = "user123";
			const bookmarkData = {
				title: "New Bookmark",
				description: "Test description",
			};

			const createdBookmark = {
				id: "bookmark1",
				...bookmarkData,
				userId,
				categoryId: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			prismaMock.bookmark.create.mockResolvedValue(createdBookmark as any);

			// Act
			const result = await bookmarkService.createBookmark(userId, bookmarkData);

			// Assert
			expect(prismaMock.bookmark.create).toHaveBeenCalledWith({
				data: {
					title: bookmarkData.title,
					description: bookmarkData.description,
					user: {
						connect: { id: userId },
					},
					tags: {
						create: [],
					},
				},
				include: {
					category: true,
					tags: {
						include: {
							tag: true,
						},
					},
				},
			});
			expect(result).toEqual(createdBookmark);
		});

		it("should create a bookmark with category and tags", async () => {
			// Arrange
			const userId = "user123";
			const categoryId = "category1";
			const tags = ["tag1", "tag2"];
			const bookmarkData = {
				title: "New Bookmark",
				description: "Test description",
				categoryId,
				tags,
			};

			const category = {
				id: categoryId,
				name: "Test Category",
				description: "Test category description",
				userId,
			};

			const tagObjects = [
				{ id: "tagid1", name: "tag1" },
				{ id: "tagid2", name: "tag2" },
			];

			prismaMock.category.findFirst.mockResolvedValue(category as any);

			prismaMock.tag.upsert.mockResolvedValue(tagObjects as any);

			const createdBookmark = {
				id: "bookmark1",
				title: bookmarkData.title,
				description: bookmarkData.description,
				userId,
				categoryId,
				createdAt: new Date(),
				updatedAt: new Date(),
				category,
				tags: [{ tag: tagObjects[0] }, { tag: tagObjects[1] }],
			};

			prismaMock.bookmark.create.mockResolvedValue(createdBookmark as any);

			// Act
			const result = await bookmarkService.createBookmark(userId, bookmarkData);

			// Assert
			expect(prismaMock.category.findFirst).toHaveBeenCalledWith({
				where: {
					id: categoryId,
					userId,
				},
			});
			expect(prismaMock.tag.upsert).toHaveBeenCalledTimes(2);
			expect(prismaMock.bookmark.create).toHaveBeenCalled();
			expect(result).toEqual(createdBookmark);
		});

		it("should throw error if category does not exist or belong to user", async () => {
			// Arrange
			const userId = "user123";
			const categoryId = "nonexistent";
			const bookmarkData = {
				title: "New Bookmark",
				description: "Test description",
				categoryId,
			};

			prismaMock.category.findFirst.mockResolvedValue(null);

			// Act & Assert
			await expect(
				bookmarkService.createBookmark(userId, bookmarkData),
			).rejects.toThrow("Category not found or does not belong to the user");
		});
	});

	describe("getBookmarkById", () => {
		it("should get a bookmark by id", async () => {
			// Arrange
			const userId = "user123";
			const bookmarkId = "bookmark1";
			const bookmark = {
				id: bookmarkId,
				title: "Test Bookmark",
				description: "Bookmark description",
				userId,
				categoryId: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			prismaMock.bookmark.findFirst.mockResolvedValue(bookmark as any);

			// Act
			const result = await bookmarkService.getBookmarkById(userId, bookmarkId);

			// Assert
			expect(prismaMock.bookmark.findFirst).toHaveBeenCalledWith({
				where: {
					id: bookmarkId,
					userId,
				},
				include: {
					category: true,
					tags: {
						include: {
							tag: true,
						},
					},
				},
			});
			expect(result).toEqual(bookmark);
		});

		it("should throw error if bookmark not found", async () => {
			// Arrange
			const userId = "user123";
			const bookmarkId = "nonexistent";

			prismaMock.bookmark.findFirst.mockResolvedValue(null);

			// Act & Assert
			await expect(
				bookmarkService.getBookmarkById(userId, bookmarkId),
			).rejects.toThrow(HTTPException);
		});
	});

	describe("updateBookmark", () => {
		it("should update bookmark fields", async () => {
			// Arrange
			const userId = "user123";
			const bookmarkId = "bookmark1";
			const updateData = {
				title: "Updated Title",
				description: "Updated description",
			};

			const existingBookmark = {
				id: bookmarkId,
				title: "Original Title",
				description: "Original description",
				userId,
				categoryId: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const updatedBookmark = {
				...existingBookmark,
				...updateData,
				updatedAt: new Date(),
			};

			prismaMock.bookmark.findFirst.mockResolvedValue(existingBookmark as any);
			prismaMock.bookmark.update.mockResolvedValue(updatedBookmark as any);

			// Act
			const result = await bookmarkService.updateBookmark(
				userId,
				bookmarkId,
				updateData,
			);

			// Assert
			expect(prismaMock.bookmark.findFirst).toHaveBeenCalledWith({
				where: {
					id: bookmarkId,
					userId,
				},
			});
			expect(prismaMock.bookmark.update).toHaveBeenCalledWith({
				where: { id: bookmarkId },
				data: {
					title: updateData.title,
					description: updateData.description,
				},
				include: {
					category: true,
					tags: {
						include: {
							tag: true,
						},
					},
				},
			});
			expect(result).toEqual(updatedBookmark);
		});

		it("should throw error if bookmark not found", async () => {
			// Arrange
			const userId = "user123";
			const bookmarkId = "nonexistent";
			const updateData = { title: "Updated Title" };

			prismaMock.bookmark.findFirst.mockResolvedValue(null);

			// Act & Assert
			await expect(
				bookmarkService.updateBookmark(userId, bookmarkId, updateData),
			).rejects.toThrow(HTTPException);
		});

		it("should update bookmark category", async () => {
			// Arrange
			const userId = "user123";
			const bookmarkId = "bookmark1";
			const categoryId = "category1";
			const updateData = {
				categoryId,
			};

			const existingBookmark = {
				id: bookmarkId,
				title: "Test Bookmark",
				description: "Description",
				userId,
				categoryId: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const category = {
				id: categoryId,
				name: "Test Category",
				description: "Test category",
				userId,
			};

			prismaMock.bookmark.findFirst.mockResolvedValue(existingBookmark as any);
			prismaMock.category.findFirst.mockResolvedValue(category as any);

			const updatedBookmark = {
				...existingBookmark,
				categoryId,
				category,
				updatedAt: new Date(),
			};

			prismaMock.bookmark.update.mockResolvedValue(updatedBookmark as any);

			// Act
			const result = await bookmarkService.updateBookmark(
				userId,
				bookmarkId,
				updateData,
			);

			// Assert
			expect(prismaMock.category.findFirst).toHaveBeenCalledWith({
				where: {
					id: categoryId,
					userId,
				},
			});
			expect(prismaMock.bookmark.update).toHaveBeenCalled();
			expect(result).toEqual(updatedBookmark);
		});

		it("should throw error if category does not exist", async () => {
			// Arrange
			const userId = "user123";
			const bookmarkId = "bookmark1";
			const categoryId = "nonexistent";
			const updateData = {
				categoryId,
			};

			const existingBookmark = {
				id: bookmarkId,
				title: "Test Bookmark",
				description: "Description",
				userId,
				categoryId: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			prismaMock.bookmark.findFirst.mockResolvedValue(existingBookmark as any);
			prismaMock.category.findFirst.mockResolvedValue(null);

			// Act & Assert
			await expect(
				bookmarkService.updateBookmark(userId, bookmarkId, updateData),
			).rejects.toThrow("Category not found or does not belong to the user");
		});
	});

	describe("deleteBookmark", () => {
		it("should delete a bookmark", async () => {
			// Arrange
			const userId = "user123";
			const bookmarkId = "bookmark1";

			const bookmark = {
				id: bookmarkId,
				title: "Test Bookmark",
				description: "Description",
				userId,
				categoryId: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			prismaMock.bookmark.findFirst.mockResolvedValue(bookmark as any);
			prismaMock.bookmark.delete.mockResolvedValue(bookmark as any);

			// Act
			const result = await bookmarkService.deleteBookmark(userId, bookmarkId);

			// Assert
			expect(prismaMock.bookmark.findFirst).toHaveBeenCalledWith({
				where: {
					id: bookmarkId,
					userId,
				},
			});
			expect(prismaMock.bookmark.delete).toHaveBeenCalledWith({
				where: { id: bookmarkId },
			});
			expect(result).toBe(true);
		});

		it("should throw error if bookmark not found", async () => {
			// Arrange
			const userId = "user123";
			const bookmarkId = "nonexistent";

			prismaMock.bookmark.findFirst.mockResolvedValue(null);

			// Act & Assert
			await expect(
				bookmarkService.deleteBookmark(userId, bookmarkId),
			).rejects.toThrow(HTTPException);
		});
	});
});
