# 🚀 Free Hosting Options for Kimberly Signature Scents

## Recommended: Render.com (Best Free Option)

### Why Render?
✅ Free PostgreSQL database (1GB)
✅ Auto-deploy from GitHub
✅ HTTPS included
✅ No credit card required
✅ Better uptime than Heroku free tier

### Step-by-Step Deployment:

#### 1. Prepare Your Code
```bash
# Make sure you're in the project root
cd "C:\Users\Tatenda\OneDrive\Documents\Kimberly Signature Scents"

# Install backend dependencies
cd backend
npm install pg
```

#### 2. Create GitHub Repository
1. Go to https://github.com
2. Click "New Repository"
3. Name: `kimberly-signature-scents`
4. Keep it Public (for free hosting)
5. Click "Create Repository"

#### 3. Push Code to GitHub
```bash
# In project root
cd "C:\Users\Tatenda\OneDrive\Documents\Kimberly Signature Scents"

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit - Kimberly Signature Scents website"

# Add GitHub remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/kimberly-signature-scents.git
git branch -M main
git push -u origin main
```

#### 4. Deploy Backend on Render
1. Go to https://render.com and sign up (use GitHub account)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `kimberly-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Instance Type**: `Free`

5. Add Environment Variables:
   - Click "Environment" tab
   - Add these variables:
     - `NODE_ENV` = `production`
     - `JWT_SECRET` = `kimberly-secret-key-2025-secure`
     - `ADMIN_EMAIL` = `murerwakimberley@gmail.com`

6. Click "Create Web Service"

#### 5. Create PostgreSQL Database
1. In Render dashboard, click "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `kimberly-database`
   - **Database**: `kimberly_scents`
   - **User**: `kimberly`
   - **Instance Type**: `Free`
3. Click "Create Database"
4. Copy the "Internal Database URL"
5. Go back to your Web Service → Environment
6. Add variable:
   - `DATABASE_URL` = [paste the Internal Database URL]
7. Click "Save Changes" (will redeploy)

#### 6. Deploy Frontend on Netlify/Vercel
**Option A: Netlify (Easier)**
1. Go to https://www.netlify.com
2. Sign up with GitHub
3. Click "Add new site" → "Import existing project"
4. Choose your GitHub repository
5. Configure:
   - **Build command**: Leave empty (static site)
   - **Publish directory**: `/`
6. Click "Deploy site"
7. Update API URLs in your frontend files

**Option B: Vercel**
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Import your repository
5. Configure same as Netlify
6. Click "Deploy"

#### 7. Update Frontend API URLs
After backend is deployed, update `api.js`:

```javascript
// Replace localhost with your Render backend URL
const API_BASE_URL = 'https://kimberly-backend.onrender.com/api';
```

Your Render URL will be: `https://[your-service-name].onrender.com`

---

## Alternative: Railway.app

### Pros:
✅ Even simpler than Render
✅ $5 free credit monthly
✅ One-click PostgreSQL

### Steps:
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add PostgreSQL: Click "New" → "Database" → "PostgreSQL"
6. Railway auto-sets DATABASE_URL
7. Add other environment variables
8. Deploy!

---

## Alternative: Vercel + Supabase

### Backend: Vercel Serverless Functions
### Database: Supabase (Free PostgreSQL)

1. **Supabase Database**:
   - Go to https://supabase.com
   - Create free project
   - Get connection string
   - Create tables using SQL editor

2. **Vercel Deployment**:
   - Deploy frontend to Vercel
   - Use API routes for backend logic
   - Connect to Supabase database

---

## ⚡ Quick Deploy Commands

```bash
# Navigate to project
cd "C:\Users\Tatenda\OneDrive\Documents\Kimberly Signature Scents"

# Install PostgreSQL driver
cd backend
npm install pg

# Go back to root
cd ..

# Initialize git
git init
git add .
git commit -m "Deploy Kimberly Signature Scents"

# Create .gitignore
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo "*.log" >> .gitignore

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/kimberly-signature-scents.git
git branch -M main
git push -u origin main
```

---

## 📋 Deployment Checklist

- [ ] Install PostgreSQL driver: `npm install pg`
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Sign up for Render.com
- [ ] Create PostgreSQL database on Render
- [ ] Deploy backend web service
- [ ] Add environment variables
- [ ] Sign up for Netlify/Vercel
- [ ] Deploy frontend
- [ ] Update API URLs in frontend
- [ ] Test registration form
- [ ] Test admin login
- [ ] Test community posts
- [ ] Test announcements

---

## 🎯 Recommended Setup (100% Free)

**Backend**: Render.com Web Service + PostgreSQL
**Frontend**: Netlify or Vercel
**Total Cost**: $0/month
**Features**: Full database, auto-deploy, HTTPS, custom domain

---

## 🆘 Need Help?

If you get stuck:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check browser console for frontend errors
3. Verify DATABASE_URL is set correctly
4. Make sure all environment variables are added
5. Check CORS settings allow your frontend domain

---

## 📧 Support

Email: murerwakimberley@gmail.com
WhatsApp: +263788171405
