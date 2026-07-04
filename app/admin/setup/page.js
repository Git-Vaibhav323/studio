'use client';

import { useState } from 'react';
import { Copy, CheckCircle, AlertCircle, Database, Key, Globe } from 'lucide-react';
import styles from './Setup.module.css';

export default function AdminSetup() {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const sqlScript = `-- Run this in your Supabase SQL Editor
-- This will create all the necessary tables for your admin panel

-- Enable RLS (Row Level Security)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update images" ON storage.objects FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete images" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    featured_image TEXT,
    gallery JSONB DEFAULT '[]'::jsonb,
    project_type VARCHAR(100),
    location VARCHAR(255),
    area VARCHAR(100),
    year INTEGER,
    status VARCHAR(50) DEFAULT 'draft',
    featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    author VARCHAR(255) DEFAULT 'The Spatial Edit',
    category VARCHAR(100),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    status VARCHAR(50) DEFAULT 'draft',
    featured BOOLEAN DEFAULT false,
    read_time INTEGER,
    sort_order INTEGER DEFAULT 0,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    project_type VARCHAR(100),
    location VARCHAR(255),
    budget VARCHAR(100),
    timeline VARCHAR(100),
    message TEXT,
    source VARCHAR(100) DEFAULT 'website',
    status VARCHAR(50) DEFAULT 'new',
    priority VARCHAR(20) DEFAULT 'medium',
    notes TEXT,
    followed_up_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description TEXT,
    detailed_description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    process_steps JSONB DEFAULT '[]'::jsonb,
    featured_image TEXT,
    gallery JSONB DEFAULT '[]'::jsonb,
    icon_svg TEXT,
    price_range VARCHAR(100),
    duration VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site content table
CREATE TABLE IF NOT EXISTS site_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_key VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255),
    content JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'active',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can read published projects" ON projects FOR SELECT USING (status = 'published');
CREATE POLICY "Authenticated users can manage projects" ON projects FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can read published blogs" ON blogs FOR SELECT USING (status = 'published');
CREATE POLICY "Authenticated users can manage blogs" ON blogs FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage leads" ON leads FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can read active services" ON services FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated users can manage services" ON services FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can read active content" ON site_content FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated users can manage content" ON site_content FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can read their own admin profile" ON admin_users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can manage admin users" ON admin_users FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);

-- Insert sample data
INSERT INTO services (title, slug, short_description, detailed_description, sort_order, status, featured) VALUES
('Spatial Planning', 'spatial-planning', 'We create the blueprint for how your space will work — layout, circulation, light and proportion.', 'Our spatial planning service focuses on creating functional and beautiful layouts that maximize space efficiency while maintaining aesthetic appeal.', 1, 'active', true),
('Interior Design', 'interior-design', 'Complete interior design services from concept to completion.', 'Full-service interior design including mood boards, material selection, furniture planning, and 3D visualizations.', 2, 'active', true),
('Project Management', 'project-management', 'End-to-end project management with one point of contact throughout.', 'We manage every contractor and supplier, providing weekly updates and quality control at each stage.', 3, 'active', false)
ON CONFLICT (slug) DO NOTHING;`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Database size={48} className={styles.icon} />
        <h1>Admin Panel Setup Required</h1>
        <p>Complete these steps to get your admin panel working</p>
      </div>

      <div className={styles.steps}>
        {/* Step 1: Supabase Project */}
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <h3><Globe size={20} /> Create Supabase Project</h3>
            <p>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a> and create a new project</p>
          </div>
        </div>

        {/* Step 2: Environment Variables */}
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <h3><Key size={20} /> Configure Environment Variables</h3>
            <p>Add these to your <code>.env.local</code> file (get values from Supabase Settings → API):</p>
            
            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <span>.env.local</span>
                <button 
                  onClick={() => copyToClipboard(`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`, 'env')}
                  className={styles.copyButton}
                >
                  {copied === 'env' ? <CheckCircle size={16} /> : <Copy size={16} />}
                  {copied === 'env' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre>
                <code>
{`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Step 3: Database Setup */}
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <h3><Database size={20} /> Run Database Setup</h3>
            <p>Copy and run this SQL script in your Supabase SQL Editor:</p>
            
            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <span>database-setup.sql</span>
                <button 
                  onClick={() => copyToClipboard(sqlScript, 'sql')}
                  className={styles.copyButton}
                >
                  {copied === 'sql' ? <CheckCircle size={16} /> : <Copy size={16} />}
                  {copied === 'sql' ? 'Copied!' : 'Copy SQL'}
                </button>
              </div>
              <div className={styles.codePreview}>
                <pre><code>{sqlScript.substring(0, 500)}...</code></pre>
                <div className={styles.codeExpand}>
                  <p>Click "Copy SQL" to get the complete script</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Storage Setup */}
        <div className={styles.step}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <h3><AlertCircle size={20} /> Enable Storage</h3>
            <p>In Supabase Dashboard, go to Storage and create a bucket named "images" with public access enabled</p>
          </div>
        </div>

        {/* Step 5: Create Admin User */}
        <div className={styles.step}>
          <div className={styles.stepNumber}>5</div>
          <div className={styles.stepContent}>
            <h3><Key size={20} /> Create Admin User</h3>
            <p>In Supabase Authentication, create your first admin user</p>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <p>After completing these steps, restart your development server to access the admin panel.</p>
        <div className={styles.links}>
          <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer">
            Supabase Documentation
          </a>
          <a href="/admin/login">
            Try Admin Login
          </a>
        </div>
      </div>
    </div>
  );
}