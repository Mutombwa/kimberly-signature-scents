# 🚀 Backend Setup & Installation Guide

## Kimberly Signature Scents - Complete System

This guide will help you set up the backend server with customer management and community platform.

---

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** (v16 or higher) installed
- **npm** (comes with Node.js)
- A code editor (VS Code recommended)

### Check if Node.js is installed:
```powershell
node --version
npm --version
```

If not installed, download from: https://nodejs.org/

---

## 🛠️ Installation Steps

### 1. Navigate to Backend Folder
```powershell
cd "c:\Users\Tatenda\OneDrive\Documents\Kimberly Signature Scents\backend"
```

### 2. Install Dependencies
```powershell
npm install
```

This will install:
- express (web server)
- cors (cross-origin requests)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- better-sqlite3 (database)
- express-validator (form validation)
- dotenv (environment variables)

### 3. Create Environment File
Copy the example environment file:
```powershell
Copy-Item .env.example .env
```

Then edit `.env` and update:
```env
PORT=3000
JWT_SECRET=your-super-secret-key-change-this-to-something-random
NODE_ENV=development

# Change admin credentials
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=YourSecurePassword123!
```

### 4. Start the Server
```powershell
npm start
```

For development with auto-reload:
```powershell
npm run dev
```

You should see:
```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🌟 Kimberly Signature Scents API Server 🌟          ║
║                                                        ║
║   Server running on: http://localhost:3000           ║
║   Environment: development                             ║
║                                                        ║
║   📱 Ready to accept requests!                        ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

## 🧪 Testing the API

### 1. Health Check
Open browser to: `http://localhost:3000/api/health`

Should return:
```json
{
  "status": "OK",
  "message": "Kimberly Signature Scents API is running",
  "timestamp": "2025-11-24T..."
}
```

### 2. Test Registration Submission
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/registrations/submit" -Method POST -ContentType "application/json" -Body '{
  "fullName": "Test User",
  "email": "test@example.com",
  "phone": "+27 123 456 789",
  "dateOfBirth": "1990-01-01",
  "address": "123 Test Street, Johannesburg",
  "kitChoice": "R1800"
}'
```

---

## 📁 Database

The system uses **SQLite** database (`database.sqlite`) which is created automatically.

### Database Tables:
1. **users** - User accounts with authentication
2. **registrations** - Form submissions from website
3. **community_posts** - Community platform posts
4. **comments** - Comments on posts
5. **post_likes** - Post likes tracking
6. **categories** - Post categories

### View Database (Optional):
Install DB Browser for SQLite:
- Download: https://sqlitebrowser.org/
- Open `backend/database.sqlite`

---

## 🌐 Connecting Frontend to Backend

### Update API URL in frontend
Edit `api.js` (line 2):
```javascript
const API_URL = 'http://localhost:3000/api';
```

### Enable CORS
The backend already has CORS enabled for all origins during development.

For production, update `server.js`:
```javascript
app.use(cors({
    origin: 'https://your-domain.com'
}));
```

---

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)

### Registrations
- `POST /api/registrations/submit` - Submit registration form (public)
- `GET /api/registrations` - Get all registrations (admin)
- `GET /api/registrations/:id` - Get one registration (admin)
- `PATCH /api/registrations/:id/status` - Update status (admin)

### Community
- `GET /api/community/posts` - Get all posts
- `GET /api/community/posts/:id` - Get single post with comments
- `GET /api/community/posts/category/:category` - Filter by category
- `POST /api/community/posts` - Create post (requires auth)
- `PUT /api/community/posts/:id` - Update post (author only)
- `DELETE /api/community/posts/:id` - Delete post (author only)
- `POST /api/community/posts/:id/comments` - Add comment (requires auth)
- `POST /api/community/posts/:id/like` - Like/unlike post (requires auth)
- `GET /api/community/categories` - Get all categories

### Users
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile` - Update own profile
- `GET /api/users/stats` - Get platform statistics

---

## 📱 Using the System

### 1. Open Website
Open `index.html` in browser (double-click or open with browser)

### 2. Register an Account
- Fill registration form on homepage OR
- Click "Register" in navigation
- Create account with email and password

### 3. Login
- Use email and password to login
- You'll receive a JWT token (stored in browser)

### 4. Access Community
- Navigate to "Community" page
- Create posts, comment, like posts
- Filter by categories

### 5. View Dashboard (Coming Soon)
- See your profile
- View your posts
- Manage your account

---

## 🔧 Troubleshooting

### Port Already in Use
If port 3000 is taken:
```powershell
# Change port in .env file
PORT=3001
```

### Database Locked Error
Close any database viewers/tools accessing the database.

### Module Not Found
```powershell
# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install
```

### CORS Errors
Ensure backend is running and API_URL in frontend is correct.

---

## 🚀 Deployment Options

### Option 1: Deploy Backend to Heroku (Free)
1. Create Heroku account
2. Install Heroku CLI
3. Deploy:
```bash
heroku create kimberly-scents-api
git push heroku main
```

### Option 2: Deploy to Railway (Free)
1. Go to railway.app
2. Connect GitHub repo
3. Auto-deploys on push

### Option 3: VPS (DigitalOcean, Linode, etc.)
1. Get VPS server
2. Install Node.js
3. Clone repository
4. Run with PM2:
```bash
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

---

## 📊 Admin Features

### View All Registrations
Login as admin, then:
```javascript
// In browser console or via admin dashboard
fetch('http://localhost:3000/api/registrations', {
    headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
    }
}).then(r => r.json()).then(console.log);
```

### Update Registration Status
```javascript
fetch('http://localhost:3000/api/registrations/1/status', {
    method: 'PATCH',
    headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        status: 'paid',
        paymentConfirmed: true,
        notes: 'Payment received via bank transfer'
    })
}).then(r => r.json()).then(console.log);
```

---

## 📧 Email Notifications (Optional)

To enable email notifications when registrations are submitted:

1. Get Gmail App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App Passwords
   - Generate password for "Mail"

2. Update `.env`:
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

3. Implement email sending in `routes/registrations.js`

---

## 🔒 Security Best Practices

1. **Change JWT_SECRET** - Use a long random string
2. **Use HTTPS** in production
3. **Validate all inputs** - Already implemented
4. **Rate limiting** - Add express-rate-limit for production
5. **Backup database** - Regular backups of `database.sqlite`

---

## 📞 Support

For issues or questions:
- Check server logs for errors
- Verify all environment variables are set
- Ensure Node.js version is 16+
- Check that port 3000 is not blocked by firewall

---

## ✅ Success Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Server starts without errors
- [ ] Health check endpoint works
- [ ] Can submit registration from website
- [ ] Can create account and login
- [ ] Community platform loads
- [ ] Can create posts and comments

---

🎉 **You're all set!** The backend is now running and ready to handle customer registrations and community interactions!
