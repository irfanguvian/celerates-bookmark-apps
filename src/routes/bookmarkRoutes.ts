import { OpenAPIHono } from '@hono/zod-openapi';
import { bookmarkController } from '../controllers/BookmarkController';
import { authMiddleware } from '../middleware/authMiddleware';
import { zValidator } from '@hono/zod-validator';
import { createBookmarkSchema, updateBookmarkSchema } from '../schemas/bookmarkSchemas';


export const bookmarkRoutes = new OpenAPIHono();

// Apply auth middleware to all bookmark routes

bookmarkRoutes.use('*', authMiddleware());

// GET /bookmarks - List all bookmarks
bookmarkRoutes.get("/", (c) => bookmarkController.getAllBookmarks(c));

// POST /bookmarks - Create a new bookmark
bookmarkRoutes.post("/", zValidator('json', createBookmarkSchema), (c) => bookmarkController.createBookmark(c));

// GET /bookmarks/:id - Retrieve a specific bookmark
bookmarkRoutes.get('/:id', (c) => bookmarkController.getBookmarkById(c));

// PUT /bookmarks/:id - Update a bookmark
bookmarkRoutes.put('/:id', zValidator('json', updateBookmarkSchema), (c) => bookmarkController.updateBookmark(c));

// DELETE /bookmarks/:id - DELETE a bookmark
bookmarkRoutes.delete('/:id', (c) => bookmarkController.deleteBookmark(c));
