import { serve } from '@hono/node-server'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import prisma from './config/database'
import { OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'

import { authRoutes } from './routes/authRoutes'
import { bookmarkRoutes } from './routes/bookmarkRoutes'
import { timingMiddleware } from './middleware/timingMiddleware'
import { cors } from 'hono/cors'
import categoryRouter from './routes/categoryRoutes'

const app = new OpenAPIHono()

// Global middlewares
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', timingMiddleware())
app.use(cors())

// OpenAPI configuration
app.doc('/openapi.json', {
    openapi: '3.0.0',
    info: {
        title: 'Bookmark Management API',
        version: 'v1',
        description: 'API documentation for the Bookmark Management System'
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Development server'
        }
    ],
    security: [
        {
            bearerAuth: []
        }
    ]
})

// Swagger UI
app.get('/docs', swaggerUI({ url: '/openapi.json' }))

// Routes
app.get('/', (c) => c.json({ message: 'Bookmark Management API' }))
app.route('/api/auth', authRoutes)
app.route('/api/bookmarks', bookmarkRoutes)
app.route('/api/categories', categoryRouter)


// 404 handler for undefined routes
app.notFound((c) => {
    return c.json({
        success: false,
        message: 'Route not found',
        errors: { route: c.req.path }
    }, 404)
})

// Start the server
const port = process.env.PORT || 3000
console.log(`Server is running on port ${port}`)

// Graceful shutdown
const handleShutdown = async () => {
    console.log('Shutting down...')
    await prisma.$disconnect()
    process.exit(0)
}

process.on('SIGINT', handleShutdown)
process.on('SIGTERM', handleShutdown)

serve({
    fetch: app.fetch,
    port: Number(port)
})

export default app
