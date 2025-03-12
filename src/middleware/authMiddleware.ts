import { Context, MiddlewareHandler } from 'hono'
import { errorResponse } from '../utils/apiResponses'
import { IAuthService } from '../entities/AuthService.entities'

export const authMiddleware = (authService: IAuthService): MiddlewareHandler => {
    return async (c: Context, next) => {
        // Get the authorization header
        const authHeader = c.req.header('Authorization')

        // Check if auth header exists and has the right format
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(c, 'Unauthorized - Missing or invalid token', undefined, 401);
        }

        // Extract the token
        const token = authHeader.slice(7)

        try {
            // Validate the token
            const isValid = authService.verifyAccessToken(token);

            if (!isValid) {
                throw new Error('Invalid token');
            }

            // Get user info and attach to context
            const user = authService.getUserFromToken(token);
            c.set('user', user);

            await next()
        } catch (error) {
            return errorResponse(c, 'Unauthorized - Invalid token', undefined, 401);
        }
    }
}
