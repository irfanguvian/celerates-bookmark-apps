import { Context } from 'hono';
import { errorResponse, successResponse } from '../utils/apiResponses';
import { IBookmarkService } from '../entities/BookmarkService';

class BookmarkController {
    bookmarkService: IBookmarkService;
    constructor(bookmarkService: IBookmarkService) {
        this.bookmarkService = bookmarkService;
    }
    async getAllBookmarks(c: Context) {
        try {
            const user = await c.get('user');
            const queryParam = c.req.query() as { limit?: number, offset?: number, search?: string };
            const bookmarks = await this.bookmarkService.getAllBookmarks(user.id, queryParam);
            return successResponse(c, { bookmarks }, 'Get Bookmarks successfully');
        } catch (error: any) {
            return errorResponse(c, 'Error occurred', error);
        }
    }

    async createBookmark(c: Context) {
        try {
            const user = await c.get('user')
            const body = await c.req.json();
            const bookmark = await this.bookmarkService.createBookmark(user.id, body);
            return successResponse(c, { bookmark }, 'Bookmark Created successfully');
        } catch (error) {
            return errorResponse(c, 'Error occurred', error);
        }
    }

    async getBookmarkById(c: Context) {
        try {
            const user = await c.get('user');
            const bookmarkId = c.req.param('id');
            const bookmark = await this.bookmarkService.getBookmarkById(user.id, bookmarkId);
            return successResponse(c, { bookmark }, 'Bookmark Get successfully');
        } catch (error) {
            return errorResponse(c, 'Error occurred', error);
        }
    }

    async updateBookmark(c: Context) {
        try {
            const user = await c.get('user');
            const bookmarkId = c.req.param('id');
            const body = await c.req.json();

            const bookmark = await this.bookmarkService.updateBookmark(user.id, bookmarkId, body);

            return successResponse(c, { bookmark }, 'Bookmark Update successfully');
        } catch (error) {
            return errorResponse(c, 'Error occurred', error);
        }
    }

    async deleteBookmark(c: Context) {
        try {
            const userId = await c.get('user').id;
            const bookmarkId = c.req.param('id');

            await this.bookmarkService.deleteBookmark(userId, bookmarkId);

            return successResponse(c, {}, 'Bookmark Delete successfully');
        } catch (error) {
            return errorResponse(c, 'Error occurred', error);
        }
    }
}

export default BookmarkController
