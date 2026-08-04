import { createServerSupabaseClient } from '@/lib/supabase';

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
    };
  }

  return {
    title: `${blog.title} | The Spatial Edit`,
    description: blog.excerpt || `Read our insights on ${blog.title}.`,
    alternates: {
      canonical: `/insights/${blog.slug}`,
    },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: blog.featured_image ? [blog.featured_image] : [],
      url: `/insights/${blog.slug}`,
      type: 'article',
    },
  };
}

export default function InsightsDetailLayout({ children }) {
  return children;
}
