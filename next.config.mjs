/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cellxgoyabievdcwxcwg.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'i0.wp.com',
        pathname: '/picjumbo.com/wp-content/uploads/**',
      },
    ],
  },
};

export default nextConfig;
