# 🌟 Kimberly Signature Scents - Backend API

Backend API server for Kimberly Signature Scents website with PostgreSQL database.

## 🚀 Features

- ✅ User authentication (register/login)
- ✅ Customer registration management
- ✅ Community platform (posts, comments, likes)
- ✅ Admin announcements system
- ✅ Exchange rate management
- ✅ Product image management
- ✅ JWT-based authentication
- ✅ PostgreSQL database
- ✅ RESTful API design

## 📋 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator

## 🛠️ Local Development Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/kimberly_scents

# Start server
npm start

# Or for development with auto-reload
npm run dev
```

The server will start on `http://localhost:3000`

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `POST /api/auth/logout` - Logout user

### Registrations
- `POST /api/registrations` - Submit registration form
- `GET /api/registrations` - Get all registrations (admin only)
- `PUT /api/registrations/:id/status` - Update registration status (admin only)

### Community
- `GET /api/community/posts` - Get all posts
- `POST /api/community/posts` - Create new post (requires auth)
- `GET /api/community/posts/:id` - Get single post
- `POST /api/community/posts/:id/comments` - Add comment (requires auth)
- `POST /api/community/posts/:id/like` - Like/unlike post (requires auth)

### Announcements (Admin Only)
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement
- `GET /api/announcements/:id` - Get single announcement
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

### Exchange Rates (Admin Only)
- `GET /api/exchange-rates/current` - Get current rate
- `GET /api/exchange-rates/history` - Get rate history
- `POST /api/exchange-rates/update` - Update rate

## 🔐 Environment Variables

```env
PORT=3000
NODE_ENV=development

# PostgreSQL Database URL
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Admin Email
ADMIN_EMAIL=murerwakimberley@gmail.com

# CORS Origin
CORS_ORIGIN=http://localhost:8080
```

## 📦 Database Schema

### Tables
- **users** - User accounts and authentication
- **registrations** - Customer registration forms
- **posts** - Community posts
- **comments** - Post comments
- **post_likes** - Post likes tracking
- **announcements** - Admin announcements
- **exchange_rates** - Currency exchange rates
- **products** - Product images and details

## 🚀 Deployment to Render.com

### Step 1: Create PostgreSQL Database

1. Go to [Render.com](https://render.com)
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `kimberly-database`
   - **Database**: `kimberly_scents`
   - **User**: `kimberly`
   - **Region**: Choose closest to your users
4. Click "Create Database"
5. **Copy** the "Internal Database URL"

### Step 2: Deploy Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `kimberly-backend`
   - **Environment**: `Node`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

4. Add Environment Variables:
   - `DATABASE_URL` = [Paste Internal Database URL from Step 1]
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `kimberly-secret-key-2025`
   - `ADMIN_EMAIL` = `murerwakimberley@gmail.com`
   - `CORS_ORIGIN` = `https://your-frontend-url.netlify.app`

5. Click "Create Web Service"

### Step 3: Update Frontend

After deployment, update `api.js` in your frontend:

```javascript
const getApiUrl = () => {
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return 'https://kimberly-backend.onrender.com/api'; // Your Render URL
    }
    return 'http://localhost:3000/api';
};
```

## 🔍 Testing

```bash
# Health check
curl http://localhost:3000/api/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+263771234567"
  }'
```

## 📊 Database Initialization

The database tables are automatically created when the server starts for the first time. The `initializeDatabase()` function in `database-postgres.js` handles table creation and indexing.

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- SQL injection prevention (parameterized queries)
- CORS protection
- Input validation
- Admin-only routes protection

## 📱 Admin Access

Admin privileges are granted to users with:
- Email: `murerwakimberley@gmail.com`
- Or users with `role` = `'admin'` in database

## 🐛 Troubleshooting

### Database Connection Error
```
❌ Error: getaddrinfo ENOTFOUND
```
**Solution**: Check DATABASE_URL in .env file

### Port Already in Use
```
❌ Error: listen EADDRINUSE :::3000
```
**Solution**: Change PORT in .env or kill process using port 3000

### JWT Token Invalid
```
❌ Error: Invalid token
```
**Solution**: Check JWT_SECRET matches between registration and login

## 📞 Support

**Email**: murerwakimberley@gmail.com  
**WhatsApp**: +263788171405

## 📝 License

Copyright © 2025 Kimberly Signature Scents. All rights reserved.
