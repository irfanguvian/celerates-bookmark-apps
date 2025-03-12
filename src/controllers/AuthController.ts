import { Context } from "hono";
import { IAuthService } from "../entities/AuthService.entities";
import { errorResponse, successResponse } from "../utils/apiResponses";

class AuthController {
	authService: IAuthService;
	constructor(authService: IAuthService) {
		this.authService = authService;
	}

	async register(c: Context) {
		try {
			const body = await c.req.json();
			const result = await this.authService.register(body);
			return successResponse(c, result, "User registered successfully");
		} catch (error: any) {
			return errorResponse(c, error.message, error);
		}
	}

	async login(c: Context) {
		try {
			const body = await c.req.json();
			const result = await this.authService.login(body);
			return successResponse(c, result, "User Login successfully");
		} catch (error: any) {
			return errorResponse(c, error.message, error);
		}
	}

	async refreshToken(c: Context) {
		try {
			const body = await c.req.json();
			const result = await this.authService.refreshToken(body.refreshToken);
			return successResponse(c, result, "Refresh Token Generate successfully");
		} catch (error) {
			return errorResponse(c, "Error occurred", error);
		}
	}

	async protectedRoute(c: Context) {
		const user = c.get("user");
		return c.json({ message: "This is a protected route", user });
	}
}

export default AuthController;
