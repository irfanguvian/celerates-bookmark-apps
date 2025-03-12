import { OpenAPIHono } from '@hono/zod-openapi';
import AuthController from '../controllers/AuthController';
import { zValidator } from '@hono/zod-validator';
import { createUserSchema, loginSchema } from '../schemas/authSchemas';


// Authentication routes
function authRoutes(authController: AuthController) {
    const routes = new OpenAPIHono();
    routes.post('/register', zValidator('json', createUserSchema), (c) => authController.register(c));
    routes.post('/login', zValidator('json', loginSchema), (c) => authController.login(c));
    routes.post('/refresh-token', (c) => authController.refreshToken(c));
    return routes;
}

export default authRoutes;