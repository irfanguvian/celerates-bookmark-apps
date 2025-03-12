import { Bookmark, PrismaClient } from "@prisma/client";
import { HTTPException } from "hono/http-exception";
import {
	BookmarkCreateInput,
	BookmarkUpdateInput,
	IBookmarkService,
	QueryParamBookmarkFilter,
} from "../entities/BookmarkService.entities";

class BookmarkService implements IBookmarkService {
	prisma: PrismaClient;
	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}
	async getAllBookmarks(userId: string, queryParam: QueryParamBookmarkFilter) {
		const { limit = 10, offset = 0, search = "", categoryId } = queryParam;

		const whereParam = {
			userId: userId,
		} as { userId: string; title?: { contains: string }; categoryId?: string };

		if (search && search != "") {
			whereParam.title = { contains: `${search}` };
		}

		if (categoryId) {
			whereParam.categoryId = categoryId;
		}

		const getBookmarks = this.prisma.bookmark.findMany({
			where: whereParam,
			include: {
				category: true,
				tags: {
					include: {
						tag: true,
					},
				},
			},
			skip: +offset,
			take: +limit,
			orderBy: { updatedAt: "desc" },
		}) as unknown as Promise<Bookmark[]>;

		return getBookmarks;
	}

	async createBookmark(userId: string, data: BookmarkCreateInput) {
		if (data.categoryId) {
			const category = await this.prisma.category.findFirst({
				where: {
					id: data.categoryId,
					userId,
				},
			});

			if (!category) {
				throw new Error("Category not found or does not belong to the user");
			}
		}

		// Handle tags
		const tagsToConnect = data.tags
			? await this.processTagsForBookmark(data.tags)
			: [];
		const createBookmarkArgs = {
			title: data.title,
			description: data.description,
			user: {
				connect: { id: userId },
			},
			tags: {
				create: tagsToConnect.map((tagId) => ({
					tag: {
						connect: { id: tagId },
					},
				})),
			},
		} as {
			title: string;
			description?: string;
			category: { connect: { id: string } };
			user: { connect: { id: string } };
			tags: { create: { tag: { connect: { id: string } } }[] };
		};

		if (data.categoryId) {
			createBookmarkArgs.category = {
				connect: { id: data.categoryId },
			};
		}
		// Create bookmark
		const bookmark = (await this.prisma.bookmark.create({
			data: createBookmarkArgs,
			include: {
				category: true,
				tags: {
					include: {
						tag: true,
					},
				},
			},
		})) as Bookmark;

		return bookmark;
	}

	async getBookmarkById(userId: string, bookmarkId: string) {
		const bookmark = await this.prisma.bookmark.findFirst({
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

		if (!bookmark) {
			throw new HTTPException(404, { message: "Bookmark not found" });
		}

		return bookmark as Bookmark;
	}

	async updateBookmark(
		userId: string,
		bookmarkId: string,
		data: BookmarkUpdateInput,
	) {
		// Check if bookmark exists and belongs to user
		const existingBookmark = await this.prisma.bookmark.findFirst({
			where: {
				id: bookmarkId,
				userId,
			},
		});

		if (!existingBookmark) {
			throw new HTTPException(404, { message: "Bookmark not found" });
		}

		// Verify category if provided
		if (data.categoryId) {
			const category = await this.prisma.category.findFirst({
				where: {
					id: data.categoryId,
					userId,
				},
			});

			if (!category) {
				throw new Error("Category not found or does not belong to the user");
			}
		}

		// Handle tags if provided
		let tagsToConnect: string[] = [];
		if (data.tags) {
			// Remove existing tag connections
			await this.prisma.tagOnBookmark.deleteMany({
				where: { bookmarkId },
			});

			tagsToConnect = await this.processTagsForBookmark(data.tags);
		}

		// Update bookmark
		const updateData: any = {
			...(data.title && { title: data.title }),
			...(data.description !== undefined && { description: data.description }),
			...(data.categoryId !== undefined && { categoryId: data.categoryId }),
		};

		const bookmark = await this.prisma.bookmark.update({
			where: { id: bookmarkId },
			data: {
				...updateData,
				...(data.tags && {
					tags: {
						create: tagsToConnect.map((tagId) => ({
							tag: {
								connect: { id: tagId },
							},
						})),
					},
				}),
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

		return bookmark as Bookmark;
	}

	async deleteBookmark(userId: string, bookmarkId: string) {
		// Check if bookmark exists and belongs to user
		const bookmark = await this.prisma.bookmark.findFirst({
			where: {
				id: bookmarkId,
				userId,
			},
		});

		if (!bookmark) {
			throw new HTTPException(404, { message: "Bookmark not found" });
		}

		// Delete the bookmark
		await this.prisma.bookmark.delete({
			where: { id: bookmarkId },
		});

		return true;
	}

	private async processTagsForBookmark(tagNames: string[]): Promise<string[]> {
		const tagIds: string[] = [];

		for (const tagName of tagNames) {
			// Find or create tag
			const tag = await this.prisma.tag.upsert({
				where: { name: tagName.toLowerCase().trim() },
				update: {},
				create: { name: tagName.toLowerCase().trim() },
			});

			tagIds.push(tag.id);
		}

		return tagIds;
	}
}

export default BookmarkService;
