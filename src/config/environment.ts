import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Environment configuration with defaults and validation
const environment = {
    // Server configuration
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),

    // Database configuration
    DATABASE_URL: process.env.DATABASE_URL || '',

    // JWT configuration
    JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',

    // API configuration
    API_PREFIX: process.env.API_PREFIX || '/api',

    // CORS configuration
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

// Validate required environment variables
const validateEnv = () => {
    const requiredEnvVars = ['DATABASE_URL'];

    if (environment.NODE_ENV === 'production') {
        requiredEnvVars.push('JWT_SECRET');
    }

    const missingEnvVars = requiredEnvVars.filter(env => !process.env[env]);

    if (missingEnvVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }
};

// Validate environment in non-test environments
if (environment.NODE_ENV !== 'test') {
    validateEnv();
}

export default environment;
