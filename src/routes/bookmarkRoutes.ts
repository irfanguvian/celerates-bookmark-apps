import { OpenAPIHono } from '@hono/zod-openapi';
import BookmarkController from '../controllers/BookmarkController';
import { zValidator } from '@hono/zod-validator';
import { createBookmarkSchema, updateBookmarkSchema } from '../schemas/bookmarkSchemas';
import { MiddlewareHandler } from 'hono';

export function bookmarkRouteHandler(
    bookmarkController: BookmarkController,
    authMiddleware : MiddlewareHandler
) {
    const routes = new OpenAPIHono();
    // Apply auth middleware to all bookmark routes

    routes.use('*', authMiddleware);

    // GET /bookmarks - List all bookmarks
    routes.get("/", (c) => bookmarkController.getAllBookmarks(c));

    // POST /bookmarks - Create a new bookmark
    routes.post("/", zValidator('json', createBookmarkSchema), (c) => bookmarkController.createBookmark(c));

    // GET /bookmarks/:id - Retrieve a specific bookmark
    routes.get('/:id', (c) => bookmarkController.getBookmarkById(c));

    // PUT /bookmarks/:id - Update a bookmark
    routes.put('/:id', zValidator('json', updateBookmarkSchema), (c) => bookmarkController.updateBookmark(c));

    // DELETE /bookmarks/:id - DELETE a bookmark
    routes.delete('/:id', (c) => bookmarkController.deleteBookmark(c));

    return routes;
}