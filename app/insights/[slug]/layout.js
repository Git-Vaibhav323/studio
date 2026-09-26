import { createServerSupabaseClient } from '@/lib/supabase';
import { createPageMetadata } from '@/lib/siteMetadata';

async function getBlog(slug) {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  const { data: blog } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  return blog;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    return {
      title: 'Article Not Found | The Spatial Edit',
      robots: { index: false, follow: false },
    };
  }

  return createPageMetadata({
    title: blog.title,
    description: blog.excerpt || `Read our insights on ${blog.title}.`,
    path: `/insights/${blog.slug}`,
    image: blog.featured_image || undefined,
    type: 'article',
  });
}

export default function InsightsDetailLayout({ children }) {
  return children;
}
