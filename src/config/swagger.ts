import { OpenAPIObject } from 'openapi3-ts/oas31';

export const swaggerConfig: OpenAPIObject = {
    openapi: '3.0.0',
    info: {
        title: 'User API',
        version: '1.0.0',
        description: 'API documentation for User operations',
    },
    servers: [
        {
            url: '/api',
            description: 'API server',
        },
    ],
    paths: {},
    components: {
        schemas: {},
    },
};
