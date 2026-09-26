import { createServerSupabaseClient } from '../lib/supabase';
import { SITE_URL } from '../lib/siteMetadata';

const routes = [
  { path: '/', priority: 1 },
  { path: '/process', priority: 0.86 },
  { path: '/services', priority: 0.9 },
  { path: '/projects', priority: 0.82 },
  { path: '/about', priority: 0.84 },
  { path: '/insights', priority: 0.76 },
  { path: '/contact', priority: 0.88 },
];

export const revalidate = 3600;

async function getContentRoutes(supabase, table, path, status) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('slug, updated_at, published_at')
      .eq('status', status);

    if (error) return [];

    return (data || []).filter((item) => item.slug).map((item) => {
      const lastModified = item.updated_at || item.published_at;
      const timestamp = lastModified ? Date.parse(lastModified) : NaN;

      return {
        url: `${SITE_URL}${path}/${encodeURIComponent(item.slug)}`,
        ...(Number.isFinite(timestamp) ? { lastModified: new Date(timestamp) } : {}),
        changeFrequency: 'monthly',
        priority: 0.72,
      };
    });
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const staticRoutes = routes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    changeFrequency: 'monthly',
    priority: route.priority,
  }));
  const supabase = createServerSupabaseClient();

  if (!supabase) return staticRoutes;

  const contentRoutes = await Promise.all([
    getContentRoutes(supabase, 'services', '/services', 'active'),
    getContentRoutes(supabase, 'projects', '/projects', 'published'),
    getContentRoutes(supabase, 'blogs', '/insights', 'published'),
  ]);

  return [...staticRoutes, ...contentRoutes.flat()];
}
