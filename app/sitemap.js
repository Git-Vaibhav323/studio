const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thespatialedit.com';

const routes = [
  { path: '/', priority: 1 },
  { path: '/process', priority: 0.86 },
  { path: '/services', priority: 0.9 },
  { path: '/projects', priority: 0.82 },
  { path: '/about', priority: 0.84 },
  { path: '/insights', priority: 0.76 },
  { path: '/contact', priority: 0.88 },
];

export default function sitemap() {
  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route.priority,
  }));
}
