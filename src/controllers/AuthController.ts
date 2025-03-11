import { Context } from 'hono';
import { authService } from '../services/AuthService';
import { HTTPException } from 'hono/http-exception';
import { errorResponse, successResponse } from '../utils/apiResponses';

class AuthController {
    async register(c: Context) {
        try {
            const body = await c.req.json();
            const result = await authService.register(body);
            return successResponse(c,result, 'User registered successfully');
        } catch (error) {
            return errorResponse(c, 'Error occurred', error);
        }
    }

    async login(c: Context) {
        try {
            const body = await c.req.json();
            const result = await authService.login(body);
            return successResponse(c, result, 'User Login successfully');
        } catch (error) {
            return errorResponse(c, 'Error occurred', error);
        }
    }

    async refreshToken(c: Context) {
        try {
            const body = await c.req.json();
            const result = await authService.refreshToken(body.refreshToken);
            return successResponse(c, result, 'Refresh Token Generate successfully');
        } catch (error) {
            return errorResponse(c, 'Error occurred', error);
        }
    }

    async protectedRoute(c: Context) {
        const user = c.get('user');
        return c.json({ message: 'This is a protected route', user });
    }
}

export const authController = new AuthController();
