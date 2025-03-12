import { User } from "@prisma/client";

export type RegisterRequest = {
	email: string;
	firstName: string;
	lastName: string;
	password: string;
	retypePassword: string;
};
export type AuthResponse = {
	user: { id: string; email: string };
	accessToken: string;
	refreshToken: string;
};
export type AuthRefreshResponse = { accessToken: string; refreshToken: string };
export type LoginRequest = { email: string; password: string };

export interface IAuthService {
	register(body: RegisterRequest): Promise<AuthResponse>;
	login(body: LoginRequest): Promise<AuthResponse>;
	refreshToken(refreshToken: string): Promise<AuthRefreshResponse>;
	generateAccessToken(userId: string): string;
	generateRefreshToken(userId: string): string;
	verifyAccessToken(token: string): { userId: string } | null;
	getUserFromToken(token: string): Promise<User | null>;
}
