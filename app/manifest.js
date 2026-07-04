export default function manifest() {
  return {
    name: 'The Spatial Edit',
    short_name: 'Spatial Edit',
    description: 'Spatial design and turnkey interior design studio in Hyderabad.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4ede0',
    theme_color: '#b4904f',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
