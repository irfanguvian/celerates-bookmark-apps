import prisma from '../config/database';
import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { SignupUserHandlerParameterType } from '../dtos/UserDto';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'secret-refresh';

class AuthService {
    async register(userData: SignupUserHandlerParameterType) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email }
        });

        if (existingUser) {
            throw new Error('User already exists');
        }

        if(userData.password != userData.retypePassword){ 
            throw new Error('Passwords do not match');
        }

        // Hash the password
        const hashedPassword = await hash(userData.password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                password: hashedPassword,
            }
        })

        // Generate tokens
        const accessToken = this.generateAccessToken(user.id);
        const refreshToken = this.generateRefreshToken(user.id);

        // Save refresh token to database (optional but recommended)
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id
            }
        });

        return {
            user: {
                id: user.id,
                email: user.email,
            },
            accessToken,
            refreshToken
        };
    }

    async login(credentials: { email: string; password: string }) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: credentials.email }
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const validPassword = await compare(credentials.password, user.password);
        if (!validPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate tokens
        const accessToken = this.generateAccessToken(user.id);
        const refreshToken = this.generateRefreshToken(user.id);

        // Save refresh token to database
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id
            }
        });

        return {
            user: {
                id: user.id,
                email: user.email,
            },
            accessToken,
            refreshToken
        };
    }

    async refreshToken(token: string) {
        try {
            // Verify the refresh token
            const decoded = verify(token, JWT_REFRESH_SECRET) as { userId: string };

            // Check if the token exists in the database
            const refreshTokenRecord = await prisma.refreshToken.findFirst({
                where: { token }
            });

            if (!refreshTokenRecord) {
                throw new Error('Invalid refresh token');
            }

            // Generate new tokens
            const accessToken = this.generateAccessToken(decoded.userId);
            const newRefreshToken = this.generateRefreshToken(decoded.userId);

            // Update refresh token in database
            await prisma.refreshToken.delete({
                where: { id: refreshTokenRecord.id }
            });

            await prisma.refreshToken.create({
                data: {
                    token: newRefreshToken,
                    userId: decoded.userId
                }
            });

            return {
                accessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    generateAccessToken(userId: string) {
        return sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
    }

    generateRefreshToken(userId: string) {
        return sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    }

    verifyAccessToken(token: string) {
        try {
            return verify(token, JWT_SECRET) as { userId: string };
        } catch (error) {
            return null;
        }
    }

    getUserFromToken(token: string) {
        const decoded = this.verifyAccessToken(token);

        if (!decoded) {
            throw new Error('Invalid token');
        }

        return prisma.user.findUnique({
            where: { id: decoded.userId }
        });
    }
}

export const authService = new AuthService();
