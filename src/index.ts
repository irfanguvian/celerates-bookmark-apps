import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import bcrypt from "bcrypt";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import jwt from "jsonwebtoken";
import prisma from "./config/database";
import AuthController from "./controllers/AuthController";
import BookmarkController from "./controllers/BookmarkController";
import CategoryController from "./controllers/CategoryController";
import { authMiddleware } from "./middleware/authMiddleware";
import { timingMiddleware } from "./middleware/timingMiddleware";
import authRoutes from "./routes/authRoutes";
import { bookmarkRouteHandler } from "./routes/bookmarkRoutes";
import { categoryRouteHandler } from "./routes/categoryRoutes";
import AuthService from "./services/AuthService";
import BookmarkService from "./services/BookmarkService";
import CategoryService from "./services/CategoryService";
const app = new OpenAPIHono();

// Global middlewares
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", timingMiddleware());
app.use(cors());

// OpenAPI configuration
app.doc("/openapi.json", {
	openapi: "3.0.0",
	info: {
		title: "Bookmark Management API",
		version: "v1",
		description: "API documentation for the Bookmark Management System",
	},
	servers: [
		{
			url: "http://localhost:3000",
			description: "Development server",
		},
	],
	security: [
		{
			bearerAuth: [],
		},
	],
});

// Swagger UI
app.get("/docs", swaggerUI({ url: "/openapi.json" }));

// Routes
app.get("/", (c) => c.json({ message: "Bookmark Management API" }));

const initAuthService = new AuthService(prisma, bcrypt, jwt);
const initAuthController = new AuthController(initAuthService);
const AuthRoutes = authRoutes(initAuthController);
app.route("/api/auth", AuthRoutes);

const authMiddlewareHandler = authMiddleware(initAuthService);

const initBookmarkService = new BookmarkService(prisma);
const initBookmarkController = new BookmarkController(initBookmarkService);
const bookmarkRoutes = bookmarkRouteHandler(
	initBookmarkController,
	authMiddlewareHandler,
);
app.route("/api/bookmarks", bookmarkRoutes);

const initCategoryService = new CategoryService(prisma);
const initCategoryController = new CategoryController(initCategoryService);
const categoryRoutes = categoryRouteHandler(
	initCategoryController,
	authMiddlewareHandler,
);

app.route("/api/categories", categoryRoutes);

// 404 handler for undefined routes
app.notFound((c) => {
	return c.json(
		{
			success: false,
			message: "Route not found",
			errors: { route: c.req.path },
		},
		404,
	);
});

// Start the server
const port = process.env.PORT || 3000;
console.log(`Server is running on port ${port}`);

// Graceful shutdown
const handleShutdown = async () => {
	console.log("Shutting down...");
	await prisma.$disconnect();
	process.exit(0);
};

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);

serve({
	fetch: app.fetch,
	port: Number(port),
});

export default app;
