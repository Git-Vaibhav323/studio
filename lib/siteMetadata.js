export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thespatialedit.in';

const defaultSocialImage = '/images/hero_living_room.png';

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  image = defaultSocialImage,
  type = 'website',
}) {
  const brandedTitle = `${title} | The Spatial Edit`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      title: brandedTitle,
      description,
      url: path,
      siteName: 'The Spatial Edit',
      images: [{ url: image, alt: brandedTitle }],
      locale: 'en_IN',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: brandedTitle,
      description,
      images: [image],
    },
  };
}