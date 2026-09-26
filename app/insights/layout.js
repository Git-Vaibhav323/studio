import { createPageMetadata } from '../../lib/siteMetadata';

export const metadata = createPageMetadata({
  title: 'Design Insights & Perspectives',
  description: 'Explore practical interior design advice, spatial design insights, home styling ideas, and articles from The Spatial Edit team.',
  keywords: ['interior design blog Hyderabad', 'spatial design guides', 'home styling tips', 'interior decoration trends'],
  path: '/insights',
});

export default function InsightsLayout({ children }) {
  return children;
}
