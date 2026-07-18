import './globals.css';
import LoadingScreen from './components/LoadingScreen';
import ScrollReveal from './components/ScrollReveal';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thespatialedit.com';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'The Spatial Edit | Spatial Design Studio in Hyderabad',
    template: '%s | The Spatial Edit',
  },
  description: 'The Spatial Edit is a spatial design and turnkey interior design studio in Hyderabad crafting homes that work beautifully and are finished to last.',
  keywords: [
    'The Spatial Edit',
    'spatial design Hyderabad',
    'interior design Hyderabad',
    'interior designers in Hyderabad',
    'turnkey interiors Hyderabad',
    'home interiors Hyderabad',
    'luxury interior design Hyderabad',
    'spatial planning',
    'villa interiors Hyderabad',
    'apartment interiors Hyderabad',
    'home renovation Hyderabad',
  ],
  applicationName: 'The Spatial Edit',
  authors: [{ name: 'The Spatial Edit' }],
  creator: 'The Spatial Edit',
  publisher: 'The Spatial Edit',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'The Spatial Edit | Spatial Design Studio in Hyderabad',
    description: 'Spaces designed to work. Finished to last.',
    url: siteUrl,
    siteName: 'The Spatial Edit',
    images: [
      {
        url: '/images/hero_living_room.png',
        width: 1200,
        height: 630,
        alt: 'The Spatial Edit interior design studio in Hyderabad',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Spatial Edit | Spatial Design Studio in Hyderabad',
    description: 'Spaces designed to work. Finished to last.',
    images: ['/images/hero_living_room.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'InteriorDesignBusiness',
    name: 'The Spatial Edit',
    url: siteUrl,
    description: metadata.description,
    image: `${siteUrl}/images/hero_living_room.png`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Hyderabad',
      addressRegion: 'Telangana',
      addressCountry: 'IN',
    },
    areaServed: ['Hyderabad', 'Telangana', 'India'],
    serviceType: ['Spatial Design', 'Interior Design', 'Turnkey Home Interiors', 'Spatial Planning'],
    founder: [
      { '@type': 'Person', name: 'Preksha Bhargav' },
      { '@type': 'Person', name: 'Krishna Bhargav' },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <LoadingScreen />
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}
