import { OpenAPIHono } from '@hono/zod-openapi';
import { authController } from '../controllers/AuthController';

export const authRoutes = new OpenAPIHono();

// Authentication routes
authRoutes.post('/register', (c) => authController.register(c));
authRoutes.post('/login', (c) => authController.login(c));
authRoutes.post('/refresh-token', (c) => authController.refreshToken(c));
