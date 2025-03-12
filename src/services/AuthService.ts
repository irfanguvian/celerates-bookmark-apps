import { PrismaClient } from '@prisma/client';
import { IAuthService, LoginRequest, RegisterRequest } from '../entities/AuthService';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'secret-refresh';

class AuthService implements IAuthService {
    prisma: PrismaClient;
    bcrypt: any;
    jwt: any;
    constructor(prisma: PrismaClient, bcrypt: any, jwt: any) {
        this.prisma = prisma;
        this.bcrypt = bcrypt;
        this.jwt = jwt;
    }


    async register(userData: RegisterRequest) {
        // Check if user already exists
        const existingUser = await this.prisma.user.findFirst({
            where: { email: userData.email }
        });

        if (existingUser) {
            throw new Error('User already exists');
        }

        if(userData.password != userData.retypePassword){ 
            throw new Error('Passwords do not match');
        }

        // Hash the password
        const hashedPassword = await this.bcrypt.hash(userData.password, 10);

        // Create user
        const user = await this.prisma.user.create({
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
        await this.prisma.refreshToken.create({
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

    async login(credentials: LoginRequest) {
        // Find user
        const user = await this.prisma.user.findFirst({
            where: { email: credentials.email }
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const validPassword = await this.bcrypt.compare(credentials.password, user.password);
        if (!validPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate tokens
        const accessToken = this.generateAccessToken(user.id);
        const refreshToken = this.generateRefreshToken(user.id);
        // Save refresh token to database
        await this.prisma.refreshToken.create({
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

    async refreshToken(refreshToken: string) {
        try {
            // Verify the refresh token
            const decoded = this.bcrypt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };

            // Check if the token exists in the database
            const refreshTokenRecord = await this.prisma.refreshToken.findFirst({
                where: { token: refreshToken }
            });

            if (!refreshTokenRecord) {
                throw new Error('Invalid refresh token');
            }

            // Generate new tokens
            const accessToken = this.generateAccessToken(decoded.userId);
            const newRefreshToken = this.generateRefreshToken(decoded.userId);

            // Update refresh token in database
            await this.prisma.refreshToken.delete({
                where: { id: refreshTokenRecord.id }
            });

            await this.prisma.refreshToken.create({
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
        return this.jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
    }

    generateRefreshToken(userId: string) {
        return this.jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    }

    verifyAccessToken(token: string) {
        try {
            return this.jwt.verify(token, JWT_SECRET) as { userId: string };
        } catch (error) {
            return null;
        }
    }

    getUserFromToken(token: string) {
        const decoded = this.jwt.verify(token, JWT_SECRET) as { userId: string };
        const getUserByID = this.prisma.user.findFirst({
            where: { id: decoded.userId }
        })
        return getUserByID;
    }
}

export default AuthService
