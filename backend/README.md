# ACE MVP Backend - Posts API

This is the backend API for the ACE MVP (Commercial Real Estate Platform) that handles post creation and management.

## Features

- **POST /api/posts** - Create new posts (NEED or HAVE)
- TypeScript support with proper type definitions
- MongoDB integration with Mongoose
- Input validation using express-validator
- Comprehensive error handling
- CORS and security middleware

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   - `PORT` - Server port (default: 5000)
   - `MONGODB_URI` - MongoDB connection string

3. **Start MongoDB with Docker Compose:**
   ```bash
   # Make sure Docker is running, then:
   docker-compose up -d
   ```

   This will start MongoDB with authentication enabled.

4. **Alternative: Local MongoDB**
   If you prefer to use your local MongoDB installation, update the `MONGO_URI` in `.env`:
   ```bash
   MONGO_URI=mongodb://localhost:27017/ace-mvp
   ```

5. **Development:**
   ```bash
   npm run dev
   ```

6. **Production Build:**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### POST /api/posts

Create a new post.

**Request Body:**
```json
{
  "type": "NEED" | "HAVE",
  "content": "Post content (1-1000 characters)",
  "userId": "User identifier string"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "type": "NEED",
    "content": "Post content",
    "userId": "user123",
    "createdAt": "2023-09-01T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `500 Internal Server Error` - Server/database errors

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Main server file
│   ├── routes/
│   │   └── posts.ts          # Posts API routes
│   ├── models/
│   │   └── Post.ts           # MongoDB Post model
│   └── types/
│       └── post.ts           # TypeScript interfaces
├── dist/                     # Compiled JavaScript (after build)
├── package.json
├── tsconfig.json
└── .env.example
```

## Technologies Used

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **express-validator** - Input validation
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Docker Compose** - Container orchestration

## Docker Compose Commands

```bash
# Start MongoDB in background
docker-compose up -d

# View running containers
docker-compose ps

# View MongoDB logs
docker-compose logs mongodb

# Stop MongoDB
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

## Development Notes

- All routes are properly typed with TypeScript
- Input validation prevents invalid data
- Error handling provides meaningful responses
- MongoDB indexes are set up for efficient queries
- The API is ready for integration with the React frontend