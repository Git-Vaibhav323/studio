import { createServerSupabaseClient } from '@/lib/supabase';
import { createPageMetadata } from '@/lib/siteMetadata';

async function getProject(slug) {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  return project;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return {
      title: 'Project Not Found | The Spatial Edit',
      robots: { index: false, follow: false },
    };
  }

  return createPageMetadata({
    title: project.title,
    description: project.description || `Explore our spatial design work on ${project.title}.`,
    path: `/projects/${project.slug}`,
    image: project.featured_image || undefined,
    type: 'article',
  });
}

export default function ProjectLayout({ children }) {
  return children;
}
