import './globals.css';
import LoadingScreen from './components/LoadingScreen';
import { SITE_URL } from '../lib/siteMetadata';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'The Spatial Edit | Interior Design Studio in Hyderabad',
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
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
    title: 'The Spatial Edit | Interior Design Studio in Hyderabad',
    description: 'Spatial design and turnkey interiors in Hyderabad. Spaces designed to work, finished to last.',
    url: SITE_URL,
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
    title: 'The Spatial Edit | Interior Design Studio in Hyderabad',
    description: 'Spatial design and turnkey interiors in Hyderabad. Spaces designed to work, finished to last.',
    images: ['/images/hero_living_room.png'],
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/logo-favicon.png', type: 'image/png' },
    ],
    shortcut: '/logo-favicon.png',
    apple: '/logo-favicon.png',
  },
};

export default function RootLayout({ children }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HomeAndConstructionBusiness',
        '@id': `${SITE_URL}/#studio`,
        name: 'The Spatial Edit',
        url: SITE_URL,
        description: metadata.description,
        image: `${SITE_URL}/images/hero_living_room.png`,
        logo: `${SITE_URL}/logo.png`,
        telephone: '+91-9100094547',
        sameAs: ['https://www.instagram.com/thespatialedit.in/'],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Hyderabad',
          addressRegion: 'Telangana',
          addressCountry: 'IN',
        },
        areaServed: ['Hyderabad', 'Telangana', 'India'],
        founder: [
          { '@type': 'Person', name: 'Preksha Bhargav' },
          { '@type': 'Person', name: 'Krishna Bhargav' },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: 'The Spatial Edit',
        url: SITE_URL,
        inLanguage: 'en-IN',
        publisher: { '@id': `${SITE_URL}/#studio` },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo-favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/logo-favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo-favicon.png" />
        <link
          rel="preload"
          as="image"
          href="/hero/frames/ezgif-frame-001.jpg"
          fetchPriority="high"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
