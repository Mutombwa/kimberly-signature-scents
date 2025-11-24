# 🚀 Deploy to Vercel + Supabase (Always-On, Never Sleeps)

## ✅ Why This Combo?

- ✅ **Never sleeps** - Instant responses 24/7
- ✅ 100% free forever
- ✅ Serverless functions (no cold starts)
- ✅ PostgreSQL database (Supabase)
- ✅ Global CDN
- ✅ Auto HTTPS
- ✅ No credit card required

---

## 📋 Step-by-Step Deployment

### Phase 1: Setup Supabase Database (5 minutes)

#### 1. Create Supabase Account
1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with GitHub
4. Click **"New project"**

#### 2. Configure Database
- **Name**: `kimberly-scents`
- **Database Password**: Create a strong password (save it!)
- **Region**: Choose closest to Zimbabwe (e.g., South Africa or Europe)
- **Pricing Plan**: **Free** (500MB database, 2GB bandwidth)
- Click **"Create new project"**
- Wait 2 minutes for database to initialize

#### 3. Get Database Connection String
1. Click **"Project Settings"** (gear icon)
2. Click **"Database"** in left menu
3. Scroll to **"Connection string"**
4. Select **"URI"** tab
5. Copy the connection string (looks like `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
6. Replace `[YOUR-PASSWORD]` with your actual password
7. **Save this** - you'll need it soon!

#### 4. Create Database Tables
1. Click **"SQL Editor"** in left menu
2. Click **"New query"**
3. Copy and paste this entire script:

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registrations table
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    address TEXT,
    starter_kit VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post likes table
CREATE TABLE post_likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

-- Announcements table
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    content TEXT NOT NULL,
    image_url TEXT,
    is_pinned BOOLEAN DEFAULT false,
    author_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exchange rates table
CREATE TABLE exchange_rates (
    id SERIAL PRIMARY KEY,
    rate DECIMAL(10, 4) NOT NULL,
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_urls TEXT[],
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_announcements_pinned ON announcements(is_pinned);
```

4. Click **"Run"** (or press F5)
5. You should see **"Success. No rows returned"**
6. ✅ Database is ready!

---

### Phase 2: Deploy Backend to Vercel (10 minutes)

#### 1. Restructure Backend for Vercel Serverless

We need to convert your Express app to Vercel serverless functions. I'll create the structure for you.

#### 2. Push to GitHub

```powershell
# Navigate to project
cd "C:\Users\Tatenda\OneDrive\Documents\Kimberly Signature Scents"

# Initialize git (if not already done)
git init
git add .
git commit -m "Deploy to Vercel with Supabase"

# Create GitHub repo at: https://github.com/new
# Name: kimberly-signature-scents

# Push to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/kimberly-signature-scents.git
git branch -M main
git push -u origin main
```

#### 3. Deploy to Vercel

1. Go to **https://vercel.com**
2. Click **"Sign Up"** → Choose **"Continue with GitHub"**
3. Click **"Import Project"** or **"Add New..."** → **"Project"**
4. Find your repository: `kimberly-signature-scents`
5. Click **"Import"**

#### 4. Configure Project

- **Framework Preset**: Other
- **Root Directory**: `./` (leave as is)
- **Build Command**: Leave empty or `npm install`
- **Output Directory**: Leave empty
- Click **"Environment Variables"**

#### 5. Add Environment Variables

Add these one by one:

| Name | Value |
|------|-------|
| `DATABASE_URL` | [Paste your Supabase connection string] |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `kimberly-secret-2025-secure-key` |
| `ADMIN_EMAIL` | `murerwakimberley@gmail.com` |

#### 6. Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. You'll get a URL like: `https://kimberly-signature-scents.vercel.app`
4. ✅ Backend is live!

---

### Phase 3: Update Frontend API URL (2 minutes)

1. Open `api.js` in your project
2. Find line ~7 where it says:
   ```javascript
   return 'https://kimberly-backend.onrender.com/api';
   ```
3. Replace with your Vercel URL:
   ```javascript
   return 'https://kimberly-signature-scents.vercel.app/api';
   ```

4. Save and push:
   ```powershell
   git add api.js
   git commit -m "Update API URL for Vercel"
   git push
   ```

5. Vercel will auto-redeploy (takes 30 seconds)

---

### Phase 4: Test Your Deployment

#### Test Backend API
Visit: `https://your-project.vercel.app/api/health`

Should see:
```json
{
  "status": "OK",
  "message": "Kimberly Signature Scents API is running"
}
```

#### Test Full Website
1. Visit your Vercel URL
2. Click **"Register"** → Create account
3. Login with new account
4. Test community → Create a post
5. Use quick-admin-login.html → Test admin features

---

## 🎯 Your URLs

After deployment:

- **Website**: `https://kimberly-signature-scents.vercel.app`
- **API**: `https://kimberly-signature-scents.vercel.app/api`
- **Database**: Supabase dashboard at `supabase.com`

---

## ⚡ Performance Benefits

| Feature | Vercel + Supabase |
|---------|-------------------|
| **Cold Start** | None - Always instant |
| **Response Time** | <100ms globally |
| **Uptime** | 99.99% |
| **Sleep Mode** | Never sleeps |
| **Database** | Always connected |
| **CDN** | Global edge network |

---

## 💰 Free Tier Limits

**Vercel Free:**
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Unlimited API requests
- ✅ HTTPS included

**Supabase Free:**
- ✅ 500MB database
- ✅ 2GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests

---

## 🔧 Optional: Custom Domain

1. Buy domain from **Namecheap** (~$10/year)
2. Vercel → Settings → Domains → Add domain
3. Update nameservers or add CNAME records
4. Done! Your site: `www.kimberlyscents.com`

---

## 🆘 Troubleshooting

**Issue: "Cannot find module 'pg'"**
**Fix**: Make sure `pg` is in dependencies in `package.json`

**Issue: Database connection failed**
**Fix**: Check DATABASE_URL in Vercel environment variables

**Issue: 404 on API routes**
**Fix**: Ensure `vercel.json` is configured correctly (I'll create this)

---

## 📞 Support

**Email**: murerwakimberley@gmail.com  
**WhatsApp**: +263788171405

---

## 🎊 Congratulations!

Your website is now:
- ✅ Live on Vercel (never sleeps)
- ✅ Connected to PostgreSQL (Supabase)
- ✅ Instant responses 24/7
- ✅ 100% free forever
- ✅ Auto-deploys from GitHub
- ✅ HTTPS secured

**Total monthly cost: $0** 🎉
