# ACE MVP - Implementation Plan

## 1. Project Overview

--ACE-- is a commercial real estate MVP where agents can post -Needs- and -Haves- and message each other directly.  
Goal: Build a working MVP quickly with staging on Replit and later production deployment.

--Stack:--

- Frontend: React
- Backend: Node.js + Express
- Database: PostgreSQL (Google Cloud SQL)
- Hosting: Replit (staging), later Vercel/Render for production

---

## 2. Repository Structure

ace-mvp/
├─ backend/ # Express server
│ ├─ index.js # Main server file
│ ├─ routes/ # API routes
│ ├─ controllers/ # Route logic
│ ├─ models/ # DB models
│ └─ config/ # DB & environment config
├─ frontend/ # React app
│ ├─ src/
│ │ ├─ components/ # Reusable UI components
│ │ ├─ pages/ # App pages
│ │ └─ App.jsx
├─ README.md
└─ .gitignore

---

## 3. Database Setup (Google Cloud SQL - Postgres)

--Tables:--

```sql
-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    city VARCHAR(255),
    password_hash TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Posts (Need/Have)
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    type VARCHAR(10),       -- 'Need' or 'Have'
    title TEXT,
    description TEXT,
    city VARCHAR(255),
    creator_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    post_id INTEGER REFERENCES posts(id),
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Backend DB connection example (backend/config/db.js)

``` js
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

module.exports = pool;
```

## 4. Backend Implementation

Main Routes:

- /auth/signup → create user
- /auth/login → login with JWT
- /posts → GET all posts, POST new post
- /messages → GET messages by user, POST new message

Middleware:

- JWT authentication
- Input validation for posts/messages

---

## 5. Frontend Implementation

### Pages

- Landing / Login / Signup
- Feed (list of Need/Have posts with filters)
- Post Form (create Need/Have)
- Messages (chat interface)
- Profile (user info + posts)

Components:

- PostCard
- MessageCard
- Navbar
- Filters

---

## 6. MVP Features

- User registration/login
- Create Need/Have posts
- View feed with filtering
- Messaging between users
- Optional admin panel for moderation

## 7. Development Workflow

1. Clone repo locally and install dependencies (npm install in backend and frontend).

2. Setup environment variables for Cloud SQL connection.

3. Run backend and frontend locally for development (npm run dev / npm start).

4. Test DB operations: create users, posts, messages.

5. Push commits to GitHub regularly.

6. Use Replit for staging (optional), to share a live URL for testing.

## 8. Deployment Plan

### Staging (MVP):

- Backend + Frontend on Replit

- Cloud SQL as database

### Production (later):

- Frontend → Vercel/Netlify

- Backend → Render/Railway (with environment variables for Cloud SQL)

- DB → Cloud SQL (production instance, private IP)

## 9. Notes

- Keep MVP simple: feed + messaging + login.

- Optional future features: badges, notifications, analytics.

- Focus first on adoption and usability, monetization later.