import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@gsap/react",
      "gsap",
      "motion",
      "lenis",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "recharts",
      "date-fns",
    ],
  },
  async redirects() {
    return [
      {
        source: "/training",
        destination: "/trainings",
        permanent: true,
      },
      {
        source: "/internships",
        destination: "/internship",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
