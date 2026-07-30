# Vercel Deployment Guide - Spatial Design Studio

## ✅ Pre-Deployment Checklist (Already Complete)

- ✅ Code pushed to GitHub: https://github.com/Git-Vaibhav323/studio.git
- ✅ Next.js build scripts configured
- ✅ .gitignore properly configured
- ✅ Supabase integration ready

---

## 📋 Required Environment Variables

Your app requires these Supabase environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Where to get these values:**
1. Go to https://supabase.com/dashboard
2. Select your project (or create one if you haven't)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

---

## 🚀 Step-by-Step Vercel Deployment

### Step 1: Sign in to Vercel
1. Go to https://vercel.com
2. Click **Sign Up** (if new) or **Log In**
3. Choose **Continue with GitHub**
4. Authorize Vercel to access your GitHub account

### Step 2: Import Your Project
1. On Vercel dashboard, click **Add New** → **Project**
2. In the repository list, find `Git-Vaibhav323/studio`
3. Click **Import** next to it

### Step 3: Configure Project Settings
**Framework Preset:** Next.js (should auto-detect)

**Root Directory:** Leave as `./` (root)

**Build Command:** `npm run build` (default, leave as-is)

**Output Directory:** `.next` (default, leave as-is)

**Install Command:** `npm install` (default, leave as-is)

### Step 4: Add Environment Variables
In the "Environment Variables" section:

1. Add variable 1:
   - **Key:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** [paste your Supabase Project URL]
   - Environment: ✅ Production ✅ Preview ✅ Development

2. Add variable 2:
   - **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** [paste your Supabase anon key]
   - Environment: ✅ Production ✅ Preview ✅ Development

3. Add variable 3:
   - **Key:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** [paste your Supabase service role key]
   - Environment: ✅ Production ✅ Preview ✅ Development

### Step 5: Deploy
1. Click **Deploy**
2. Wait 2-3 minutes for the build to complete
3. Once deployed, you'll get a live URL like: `https://studio-xyz.vercel.app`

---

## ⚙️ Post-Deployment Configuration

### 1. Configure Supabase Database (If Not Already Done)

Your app needs these tables in Supabase:

#### **blogs** table
```sql
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **projects** table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  featured_image TEXT,
  category TEXT,
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **services** table
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  icon TEXT,
  featured_image TEXT,
  order_index INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **leads** table
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  service TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **media** table
```sql
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT,
  size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Configure Supabase Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Create a new bucket named `media`
3. Set it to **Public** (or configure policies as needed)
4. Update storage policies:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
```

### 3. Set Up Admin User (First Time)

Visit your deployed site at: `https://your-site.vercel.app/admin/setup`

This page will guide you through:
- Creating your first admin user in Supabase Auth
- Setting up Row Level Security (RLS) policies
- Initializing the database

### 4. Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions
5. SSL certificate will be auto-generated

### 5. Configure Allowed URLs in Supabase

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URLs to **Redirect URLs**:
   ```
   https://your-site.vercel.app/admin/**
   https://your-site.vercel.app/api/**
   ```

---

## 🔄 Continuous Deployment

Vercel is now connected to your GitHub repo. Every time you push to `main`:
1. Vercel automatically detects the push
2. Builds your app
3. Deploys the new version
4. Your site updates in ~2-3 minutes

**Preview Deployments:** Every pull request gets its own preview URL automatically.

---

## 🔍 Monitoring & Logs

### View Deployment Logs
1. Go to Vercel dashboard
2. Select your project
3. Click on any deployment to see:
   - Build logs
   - Function logs
   - Runtime errors

### Performance Monitoring
Vercel provides built-in:
- **Speed Insights** - Core Web Vitals tracking
- **Analytics** - Page views and visitor data
- **Real-time Logs** - Server and function execution logs

---

## 🐛 Troubleshooting Common Issues

### Build Fails
- Check **Deployments** → **Build Logs** in Vercel
- Verify all environment variables are set correctly
- Ensure `npm run build` works locally

### 500 Internal Server Error
- Check **Functions** logs in Vercel dashboard
- Verify Supabase credentials are correct
- Check database tables exist

### Images Not Loading
- Verify Supabase Storage bucket `media` exists and is public
- Check storage policies allow public read access

### Admin Login Not Working
- Complete the setup at `/admin/setup` first
- Verify Supabase Auth is configured
- Check allowed redirect URLs in Supabase

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

## 🎉 Success Checklist

- [ ] Site deployed and accessible at Vercel URL
- [ ] Environment variables configured
- [ ] Supabase database tables created
- [ ] Supabase storage bucket created
- [ ] Admin setup completed at `/admin/setup`
- [ ] Test admin login at `/admin/login`
- [ ] Contact form working (test at homepage)
- [ ] Images uploading correctly in admin panel
- [ ] Custom domain configured (if applicable)

---

**Your GitHub Repo:** https://github.com/Git-Vaibhav323/studio.git
**Next Step:** Deploy on Vercel following steps above
