import { OpenAPIHono } from '@hono/zod-openapi';
import { authController } from '../controllers/AuthController';
import { zValidator } from '@hono/zod-validator';
import { createUserSchema, loginSchema } from '../schemas/authSchemas';

export const authRoutes = new OpenAPIHono();

// Authentication routes
authRoutes.post('/register', zValidator('json', createUserSchema), (c) => authController.register(c));
authRoutes.post('/login', zValidator('json', loginSchema), (c) => authController.login(c));
authRoutes.post('/refresh-token', (c) => authController.refreshToken(c));
