import { HTTPException } from "hono/http-exception";
import AuthService from "../../services/AuthService";
import { prismaMock } from "../singleton";

describe("AuthService", () => {
	let authService: AuthService;
	let bcryptMock: any;
	let jwtMock: any;

	beforeEach(() => {
		// Create mock implementations
		bcryptMock = {
			hash: jest.fn().mockResolvedValue("hashed_password"),
			compare: jest.fn().mockResolvedValue(true),
			verify: jest.fn().mockImplementation((token, secret) => {
				if (token === "valid_refresh_token") {
					return { userId: "user123" };
				}
				throw new Error("Invalid token");
			}),
		};

		jwtMock = {
			sign: jest.fn().mockImplementation((payload, secret, options) => {
				if (payload.userId === "user123") {
					return secret === "secret"
						? "mock_access_token"
						: "mock_refresh_token";
				}
				return "token";
			}),
			verify: jest.fn().mockImplementation((token, secret) => {
				if (token === "valid_token") {
					return { userId: "user123" };
				}
				throw new Error("Invalid token");
			}),
		};

		authService = new AuthService(prismaMock, bcryptMock, jwtMock);
	});

	describe("register", () => {
		it("should register a new user successfully", async () => {
			// Arrange
			const userData = {
				email: "test@example.com",
				firstName: "Test",
				lastName: "User",
				password: "password123",
				retypePassword: "password123",
			};

			prismaMock.user.findFirst.mockResolvedValue(null);
			prismaMock.user.create.mockResolvedValue({
				id: "user123",
				email: userData.email,
				firstName: userData.firstName,
				lastName: userData.lastName,
				password: "hashed_password",
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			prismaMock.refreshToken.create.mockResolvedValue({
				id: "token1",
				token: "mock_refresh_token",
				userId: "user123",
				createdAt: new Date(),
				updatedAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			});

			// Act
			const result = await authService.register(userData);

			// Assert
			expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
				where: { email: userData.email },
			});
			expect(bcryptMock.hash).toHaveBeenCalledWith(userData.password, 10);
			expect(prismaMock.user.create).toHaveBeenCalledWith({
				data: {
					email: userData.email,
					firstName: userData.firstName,
					lastName: userData.lastName,
					password: "hashed_password",
				},
			});
			expect(jwtMock.sign).toHaveBeenCalledTimes(2);
			expect(prismaMock.refreshToken.create).toHaveBeenCalled();
			expect(result).toEqual({
				user: {
					id: "user123",
					email: userData.email,
				},
				accessToken: "mock_access_token",
				refreshToken: "mock_refresh_token",
			});
		});

		it("should throw an error if user already exists", async () => {
			// Arrange
			const userData = {
				email: "existing@example.com",
				firstName: "Test",
				lastName: "User",
				password: "password123",
				retypePassword: "password123",
			};

			prismaMock.user.findFirst.mockResolvedValue({
				id: "existing_user",
				email: userData.email,
				firstName: "Existing",
				lastName: "User",
				password: "already_hashed",
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			// Act & Assert
			await expect(authService.register(userData)).rejects.toThrow(
				"User already exists",
			);
		});

		it("should throw an error if passwords do not match", async () => {
			// Arrange
			const userData = {
				email: "test@example.com",
				firstName: "Test",
				lastName: "User",
				password: "password123",
				retypePassword: "differentPassword",
			};

			prismaMock.user.findFirst.mockResolvedValue(null);

			// Act & Assert
			await expect(authService.register(userData)).rejects.toThrow(
				"Passwords do not match",
			);
		});
	});

	describe("login", () => {
		it("should log in a user successfully", async () => {
			// Arrange
			const credentials = {
				email: "test@example.com",
				password: "password123",
			};

			prismaMock.user.findFirst.mockResolvedValue({
				id: "user123",
				email: credentials.email,
				firstName: "Test",
				lastName: "User",
				password: "hashed_password",
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			prismaMock.refreshToken.create.mockResolvedValue({
				id: "token1",
				token: "mock_refresh_token",
				userId: "user123",
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			// Act
			const result = await authService.login(credentials);

			// Assert
			expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
				where: { email: credentials.email },
			});
			expect(bcryptMock.compare).toHaveBeenCalledWith(
				credentials.password,
				"hashed_password",
			);
			expect(jwtMock.sign).toHaveBeenCalledTimes(2);
			expect(prismaMock.refreshToken.create).toHaveBeenCalled();
			expect(result).toEqual({
				user: {
					id: "user123",
					email: credentials.email,
				},
				accessToken: "mock_access_token",
				refreshToken: "mock_refresh_token",
			});
		});

		it("should throw an error if user does not exist", async () => {
			// Arrange
			const credentials = {
				email: "nonexistent@example.com",
				password: "password123",
			};

			prismaMock.user.findFirst.mockResolvedValue(null);

			// Act & Assert
			await expect(authService.login(credentials)).rejects.toThrow(
				"Invalid credentials",
			);
		});

		it("should throw an error if password is incorrect", async () => {
			// Arrange
			const credentials = {
				email: "test@example.com",
				password: "wrong_password",
			};

			prismaMock.user.findFirst.mockResolvedValue({
				id: "user123",
				email: credentials.email,
				firstName: "Test",
				lastName: "User",
				password: "hashed_password",
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			bcryptMock.compare.mockResolvedValue(false);

			// Act & Assert
			await expect(authService.login(credentials)).rejects.toThrow(
				"Invalid credentials",
			);
		});
	});

	describe("refreshToken", () => {
		it("should refresh tokens successfully", async () => {
			// Arrange
			const refreshToken = "valid_refresh_token";

			prismaMock.refreshToken.findFirst.mockResolvedValue({
				id: "token1",
				token: refreshToken,
				userId: "user123",
				createdAt: new Date(),
				updatedAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			});

			prismaMock.refreshToken.delete.mockResolvedValue({
				id: "token1",
				token: refreshToken,
				userId: "user123",
				createdAt: new Date(),
				updatedAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			});

			prismaMock.refreshToken.create.mockResolvedValue({
				id: "token2",
				token: "new_refresh_token",
				userId: "user123",
				createdAt: new Date(),
				updatedAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			});

			// Act
			const result = await authService.refreshToken(refreshToken);

			// Assert
			expect(bcryptMock.verify).toHaveBeenCalledWith(
				refreshToken,
				expect.any(String),
			);
			expect(prismaMock.refreshToken.findFirst).toHaveBeenCalledWith({
				where: { token: refreshToken },
			});
			expect(prismaMock.refreshToken.delete).toHaveBeenCalledWith({
				where: { id: "token1" },
			});
			expect(prismaMock.refreshToken.create).toHaveBeenCalled();
			expect(result).toEqual({
				accessToken: "mock_access_token",
				refreshToken: "mock_refresh_token",
			});
		});

		it("should throw an error if refresh token is invalid", async () => {
			// Arrange
			const refreshToken = "invalid_refresh_token";
			bcryptMock.verify.mockImplementation(() => {
				throw new Error("Invalid refresh token");
			});

			// Act & Assert
			await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
				"Invalid refresh token",
			);
		});

		it("should throw an error if refresh token is not found in database", async () => {
			// Arrange
			const refreshToken = "valid_refresh_token";
			prismaMock.refreshToken.findFirst.mockResolvedValue(null);

			// Act & Assert
			await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
				"Invalid refresh token",
			);
		});
	});

	describe("verifyAccessToken", () => {
		it("should verify a valid token", () => {
			// Arrange
			const token = "valid_token";

			// Act
			const result = authService.verifyAccessToken(token);

			// Assert
			expect(jwtMock.verify).toHaveBeenCalledWith(token, expect.any(String));
			expect(result).toEqual({ userId: "user123" });
		});

		it("should return null for invalid token", () => {
			// Arrange
			const token = "invalid_token";
			jwtMock.verify.mockImplementation(() => {
				throw new Error("Invalid token");
			});

			// Act
			const result = authService.verifyAccessToken(token);

			// Assert
			expect(result).toBeNull();
		});
	});

	describe("getUserFromToken", () => {
		it("should get user from token", async () => {
			// Arrange
			const token = "valid_token";
			const user = {
				id: "user123",
				email: "test@example.com",
				firstName: "Test",
				lastName: "User",
				createdAt: new Date(),
				updatedAt: new Date(),
				password: "hashed_password",
			};

			jwtMock.verify.mockReturnValue({ userId: "user123" });
			prismaMock.user.findFirst.mockResolvedValue(user);

			// Act
			const result = await authService.getUserFromToken(token);

			// Assert
			expect(jwtMock.verify).toHaveBeenCalledWith(token, expect.any(String));
			expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
				where: { id: "user123" },
			});
			expect(result).toEqual(user);
		});
	});
});
