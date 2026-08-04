import { createServerSupabaseClient } from '@/lib/supabase';

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
    };
  }

  return {
    title: `${project.title} | The Spatial Edit`,
    description: project.description || `Explore our spatial design work on ${project.title}.`,
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.featured_image ? [project.featured_image] : [],
      url: `/projects/${project.slug}`,
      type: 'article',
    },
  };
}

export default function ProjectLayout({ children }) {
  return children;
}
