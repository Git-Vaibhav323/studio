const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thespatialedit.com';
const host = new URL(siteUrl).host;

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host,
  };
}
