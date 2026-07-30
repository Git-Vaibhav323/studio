-- ============================================
-- THE SPATIAL EDIT SUPABASE DATABASE SETUP
-- ============================================

-- Enable RLS (Row Level Security)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true);

-- Allow public access to images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update images" ON storage.objects FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete images" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- ============================================
-- PROJECTS TABLE
-- ============================================

CREATE TABLE projects (
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

-- Create indexes
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_projects_sort_order ON projects(sort_order);

-- ============================================
-- BLOGS TABLE
-- ============================================

CREATE TABLE blogs (
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

-- Create indexes
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_category ON blogs(category);
CREATE INDEX idx_blogs_featured ON blogs(featured);
CREATE INDEX idx_blogs_published_at ON blogs(published_at);
CREATE INDEX idx_blogs_sort_order ON blogs(sort_order);

-- ============================================
-- LEADS TABLE
-- ============================================

CREATE TABLE leads (
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

-- Create indexes
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_priority ON leads(priority);
CREATE INDEX idx_leads_created_at ON leads(created_at);

-- ============================================
-- SERVICES TABLE
-- ============================================

CREATE TABLE services (
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

-- Create indexes
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_featured ON services(featured);
CREATE INDEX idx_services_sort_order ON services(sort_order);

-- ============================================
-- SITE CONTENT TABLE
-- ============================================

CREATE TABLE site_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_key VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255),
    content JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_site_content_section_key ON site_content(section_key);

-- ============================================
-- ADMIN USERS TABLE
-- ============================================

CREATE TABLE admin_users (
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

-- Create index
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Public can read published projects" ON projects FOR SELECT USING (status = 'published');
CREATE POLICY "Authenticated users can manage projects" ON projects FOR ALL USING (auth.role() = 'authenticated');

-- Blogs policies
CREATE POLICY "Public can read published blogs" ON blogs FOR SELECT USING (status = 'published');
CREATE POLICY "Authenticated users can manage blogs" ON blogs FOR ALL USING (auth.role() = 'authenticated');

-- Leads policies (admin only)
CREATE POLICY "Authenticated users can manage leads" ON leads FOR ALL USING (auth.role() = 'authenticated');

-- Services policies
CREATE POLICY "Public can read active services" ON services FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated users can manage services" ON services FOR ALL USING (auth.role() = 'authenticated');

-- Site content policies
CREATE POLICY "Public can read active content" ON site_content FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated users can manage content" ON site_content FOR ALL USING (auth.role() = 'authenticated');

-- Admin users policies
CREATE POLICY "Users can read their own admin profile" ON admin_users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can manage admin users" ON admin_users FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON site_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL SAMPLE DATA
-- ============================================

-- Insert initial site content
INSERT INTO site_content (section_key, title, content) VALUES
('hero_section', 'Hero Section', '{
    "title": "Spaces designed to work. Finished to last.",
    "subtitle": "The Spatial Edit is a spatial design and turnkey interior design studio in Hyderabad crafting homes that work beautifully.",
    "cta_text": "Start Your Project",
    "background_video": "/motion/hero-sequence.mp4"
}'),
('about_section', 'About Section', '{
    "title": "About The Spatial Edit",
    "description": "We are a spatial design studio that creates homes which work beautifully and are finished to last.",
    "features": ["Spatial Planning", "Interior Design", "Project Management", "Quality Assurance"]
}');

-- Insert sample services
INSERT INTO services (title, slug, short_description, detailed_description, sort_order, status, featured) VALUES
('Spatial Planning', 'spatial-planning', 'We create the blueprint for how your space will work — layout, circulation, light and proportion.', 'Our spatial planning service focuses on creating functional and beautiful layouts that maximize space efficiency while maintaining aesthetic appeal.', 1, 'active', true),
('Interior Design', 'interior-design', 'Complete interior design services from concept to completion.', 'Full-service interior design including mood boards, material selection, furniture planning, and 3D visualizations.', 2, 'active', true),
('Project Management', 'project-management', 'End-to-end project management with one point of contact throughout.', 'We manage every contractor and supplier, providing weekly updates and quality control at each stage.', 3, 'active', false);

-- Insert sample projects
INSERT INTO projects (title, slug, description, short_description, project_type, location, status, featured, sort_order) VALUES
('Modern Villa Interior', 'modern-villa-interior', 'A contemporary villa design focusing on open spaces and natural light.', 'Contemporary villa with emphasis on spatial flow and natural materials.', 'Villa', 'Jubilee Hills, Hyderabad', 'published', true, 1),
('Urban Apartment Renovation', 'urban-apartment-renovation', 'Complete renovation of a 3BHK apartment in the heart of the city.', 'Modern apartment renovation with smart storage solutions.', 'Apartment', 'Banjara Hills, Hyderabad', 'published', false, 2);

-- Insert sample blog posts
INSERT INTO blogs (title, slug, excerpt, content, category, status, featured, published_at, sort_order) VALUES
('The Importance of Spatial Planning', 'importance-of-spatial-planning', 'Understanding why spatial planning is the foundation of great interior design.', 'Spatial planning is more than just arranging furniture. It''s about understanding how people move through and use spaces...', 'Design Tips', 'published', true, NOW(), 1),
('Choosing the Right Materials', 'choosing-right-materials', 'A guide to selecting materials that last and look beautiful over time.', 'Material selection is crucial for creating spaces that stand the test of time...', 'Materials', 'published', false, NOW(), 2);

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

-- Add a completion notice
DO $$
BEGIN
    RAISE NOTICE 'The Spatial Edit database setup completed successfully!';
    RAISE NOTICE 'Tables created: projects, blogs, leads, services, site_content, admin_users';
    RAISE NOTICE 'Storage bucket created: images';
    RAISE NOTICE 'Sample data inserted for initial testing';
END $$;