module.exports = {
  // ...existing code...
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all hostnames
        pathname: '/**',
      },
    ],
  },
};