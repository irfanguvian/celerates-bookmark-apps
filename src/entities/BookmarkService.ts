import { Bookmark } from "@prisma/client";

export type BookmarkCreateInput = {
    title: string;
    description?: string;
    categoryId?: string;
    tags?: string[];
}

export type BookmarkUpdateInput = {
    title?: string;
    description?: string;
    categoryId?: string;
    tags?: string[];
}

export type QueryParamBookmarkFilter = { limit?: number, offset?: number, search?: string, categoryId?: string }

export interface IBookmarkService {
    getAllBookmarks(userId: string, queryParam: QueryParamBookmarkFilter): Promise<Bookmark[]>;
    createBookmark(userId: string, data: BookmarkCreateInput): Promise<Bookmark>;
    getBookmarkById(userId: string, bookmarkId: string): Promise<Bookmark>;
    updateBookmark(userId: string, bookmarkId: string, data: BookmarkUpdateInput): Promise<Bookmark>;
    deleteBookmark(userId: string, bookmarkId: string): Promise<boolean>;
}