import { createPageMetadata } from '../../lib/siteMetadata';

export const metadata = createPageMetadata({
  title: 'About Our Studio',
  description: 'Meet Preksha and Krishna Bhargav, founders of The Spatial Edit, a spatial design and turnkey interior studio based in Hyderabad.',
  keywords: ['interior design founders Hyderabad', 'about spatial design studio', 'turnkey interiors Hyderabad team'],
  path: '/about',
});

export default function AboutLayout({ children }) {
  return children;
}
