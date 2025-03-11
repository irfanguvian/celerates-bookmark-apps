# Hono Backend Starter

A starter repository for building backend applications with Hono.js, TypeScript, Prisma, and JWT authentication.

## Project Structure

```
backend-celarates/
├── prisma/
│   └── schema.prisma     # Database schema definition
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── schemas/           # Schema definitions using Zod
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic implementation
│   └── index.ts          # Application entry point
├── .env.example          # Example environment variables
├── biome.json            # Biome configuration
├── package.json          # Project dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Technology Stack

- **TypeScript**: Strongly typed programming language that builds on JavaScript
- **Hono.js**: Fast, lightweight web framework for the edge and serverless
- **Prisma**: Next-generation ORM for Node.js and TypeScript
- **PostgreSQL**: Open-source relational database
- **JWT**: JSON Web Tokens for secure authentication
- **Zod**: TypeScript-first schema validation with static type inference

## Local Setup

### Prerequisites

- Node.js (v18.0.0 or later)
- pnpm (v8.0.0 or later)
- PostgreSQL

### Installation Steps

1. **Clone the repository**

```bash
git clone <repository-url>
cd backend-celarates
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Copy the example environment file and update with your configuration:

```bash
cp .env.example .env
```

Edit the `.env` file with your database connection details:

```
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
DATABASE_URL="postgresql://username:password@localhost:5432/hono_backend_db?schema=public"
```

4. **Set up the database**

```bash
# Generate Prisma client
pnpm prisma:generate

# Create and apply migrations
pnpm prisma:migrate

# Or push the schema directly to the database
pnpm prisma:push
```

5. **Start the development server**

```bash
pnpm dev
```

The server will start on the port specified in your `.env` file (default: 3000).

6. **Running tests**

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Project Usage

### API Documentation

The API documentation is available at `/openapi.json` and a Swagger UI interface at `/docs`.

### Authentication

1. **Register a new user**
   ```
   POST /auth/register
   ```

2. **Login**
   ```
   POST /auth/login
   ```
   Successful login returns an access token and refresh token.

3. **Refresh Token**
   ```
   POST /auth/refresh
   ```

### Bookmarks

All bookmark endpoints require authentication.

1. **Get all bookmarks**
   ```
   GET /bookmarks
   ```
   Supports pagination, search, and filtering by category.

2. **Create a bookmark**
   ```
   POST /bookmarks
   ```

3. **Get a specific bookmark**
   ```
   GET /bookmarks/:id
   ```

4. **Update a bookmark**
   ```
   PUT /bookmarks/:id
   ```

5. **Delete a bookmark**
   ```
   DELETE /bookmarks/:id
   ```

### Categories

All category endpoints require authentication.

1. **Get all categories**
   ```
   GET /categories
   ```

2. **Create a category**
   ```
   POST /categories
   ```

3. **Get a specific category**
   ```
   GET /categories/:id
   ```

4. **Update a category**
   ```
   PUT /categories/:id
   ```

5. **Delete a category**
   ```
   DELETE /categories/:id
   ```

## API DOCUMENTATION
Postman - [Documentation](https://documenter.getpostman.com/view/14873468/2sAYk7Siqm)

## License

[Add your license information here]

## Contributing

[Add contribution guidelines here]
