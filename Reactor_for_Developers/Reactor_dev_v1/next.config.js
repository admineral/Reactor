/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  redirects: async () => {
    return [
      {
        source: "/github",
        destination: "https://github.com/admineral/Reactor",
        permanent: true,
      },
      {
        source: "/Home",
        destination: "https://chathn-reactor.vercel.app",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
