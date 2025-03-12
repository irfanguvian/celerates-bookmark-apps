import { Context } from "hono";
import AuthController from "../../controllers/AuthController";
import { IAuthService } from "../../entities/AuthService.entities";
import AuthService from "../../services/AuthService";
import { errorResponse, successResponse } from "../../utils/apiResponses";
import { prismaMock } from "../singleton";

// Mock dependencies
jest.mock("../../services/AuthService");
jest.mock("../../utils/apiResponses");

describe("AuthController", () => {
	let mockContext: Partial<Context>;
	let mockReq: { json: jest.Mock };
	let controller: AuthController;
	let authService: IAuthService;
	beforeEach(() => {
		// Reset mocks
		jest.clearAllMocks();
		// Mock context and request
		mockReq = { json: jest.fn() };
		mockContext = {
			req: mockReq as any,
			get: jest.fn().mockImplementation((key) => {
				if (key === "user") return { id: "user123", email: "test@example.com" };
				return null;
			}),
		};

		(successResponse as jest.Mock).mockReturnValue("success");
		(errorResponse as jest.Mock).mockReturnValue("error");

		authService = new AuthService(prismaMock, jest.fn(), jest.fn());
		controller = new AuthController(authService);
	});

	describe("register", () => {
		it("should successfully register a user", async () => {
			// Arrange
			const registerData = {
				email: "test@example.com",
				firstName: "Test",
				lastName: "User",
				password: "password",
				retypePassword: "password",
			};
			const serviceResponse = {
				user: { id: "user123", email: "test@example.com" },
				accessToken: "token123",
				refreshToken: "refresh123",
			};

			mockReq.json.mockResolvedValue(registerData);
			(authService.register as jest.Mock).mockResolvedValue(serviceResponse);

			// Act
			const result = await controller.register(mockContext as Context);

			// Assert
			expect(authService.register).toHaveBeenCalledWith(registerData);
			expect(successResponse).toHaveBeenCalledWith(
				mockContext,
				serviceResponse,
				"User registered successfully",
			);
			expect(result).toBe("success");
		});

		it("should handle registration errors", async () => {
			// Arrange
			const registerData = {
				email: "test@example.com",
				password: "password",
			};
			const error = new Error("Registration failed");

			mockReq.json.mockResolvedValue(registerData);
			(authService.register as jest.Mock).mockRejectedValue(error);

			// Act
			const result = await controller.register(mockContext as Context);

			// Assert
			expect(errorResponse).toHaveBeenCalledWith(
				mockContext,
				error.message,
				error,
			);
			expect(result).toBe("error");
		});
	});

	describe("login", () => {
		it("should successfully log in a user", async () => {
			// Arrange
			const loginData = {
				email: "test@example.com",
				password: "password",
			};
			const serviceResponse = {
				user: { id: "user123", email: "test@example.com" },
				accessToken: "token123",
				refreshToken: "refresh123",
			};

			mockReq.json.mockResolvedValue(loginData);
			(authService.login as jest.Mock).mockResolvedValue(serviceResponse);

			// Act
			const result = await controller.login(mockContext as Context);

			// Assert
			expect(authService.login).toHaveBeenCalledWith(loginData);
			expect(successResponse).toHaveBeenCalledWith(
				mockContext,
				serviceResponse,
				"User Login successfully",
			);
			expect(result).toBe("success");
		});

		it("should handle login errors", async () => {
			// Arrange
			const loginData = {
				email: "test@example.com",
				password: "wrong-password",
			};
			const error = new Error("Invalid credentials");

			mockReq.json.mockResolvedValue(loginData);
			(authService.login as jest.Mock).mockRejectedValue(error);

			// Act
			const result = await controller.login(mockContext as Context);

			// Assert
			expect(errorResponse).toHaveBeenCalledWith(
				mockContext,
				error.message,
				error,
			);
			expect(result).toBe("error");
		});
	});

	describe("refreshToken", () => {
		it("should successfully refresh a token", async () => {
			// Arrange
			const tokenData = { refreshToken: "refresh123" };
			const serviceResponse = {
				accessToken: "new-token123",
				refreshToken: "new-refresh123",
			};

			mockReq.json.mockResolvedValue(tokenData);
			(authService.refreshToken as jest.Mock).mockResolvedValue(
				serviceResponse,
			);

			// Act
			const result = await controller.refreshToken(mockContext as Context);

			// Assert
			expect(authService.refreshToken).toHaveBeenCalledWith(
				tokenData.refreshToken,
			);
			expect(successResponse).toHaveBeenCalledWith(
				mockContext,
				serviceResponse,
				"Refresh Token Generate successfully",
			);
			expect(result).toBe("success");
		});

		it("should handle refresh token errors", async () => {
			// Arrange
			const tokenData = { refreshToken: "invalid-token" };
			const error = new Error("Invalid refresh token");

			mockReq.json.mockResolvedValue(tokenData);
			(authService.refreshToken as jest.Mock).mockRejectedValue(error);

			// Act
			const result = await controller.refreshToken(mockContext as Context);

			// Assert
			expect(errorResponse).toHaveBeenCalledWith(
				mockContext,
				"Error occurred",
				error,
			);
			expect(result).toBe("error");
		});
	});

	describe("protectedRoute", () => {
		it("should return user data for protected routes", async () => {
			// Arrange
			const user = { id: "user123", email: "test@example.com" };
			mockContext.get = jest.fn().mockReturnValue(user);
			mockContext.json = jest.fn().mockReturnValue("json-response");

			// Act
			const result = await controller.protectedRoute(mockContext as Context);

			// Assert
			expect(mockContext.get).toHaveBeenCalledWith("user");
			expect(mockContext.json).toHaveBeenCalledWith({
				message: "This is a protected route",
				user,
			});
			expect(result).toBe("json-response");
		});
	});
});
