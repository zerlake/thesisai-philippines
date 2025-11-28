import {withSentryConfig} from "@sentry/nextjs";
import withBundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from "next";

// CDN and geographic configuration for AMP cache optimization
const CDN_REGIONS = {
  us: {
    primary: "cdn-us.example.com",
    secondary: "cdn-us-backup.example.com",
    cache_ttl: 3600, // 1 hour for dynamic content
  },
  eu: {
    primary: "cdn-eu.example.com",
    secondary: "cdn-eu-backup.example.com",
    cache_ttl: 3600,
  },
  apac: {
    primary: "cdn-apac.example.com",
    secondary: "cdn-apac-backup.example.com",
    cache_ttl: 3600,
  },
};

// AMP cache headers and prerendering config
const AMP_PRERENDER_PATHS = [
  "/",
  "/dashboard",
  "/help",
  "/privacy",
  "/terms",
];

const nextConfig: NextConfig = {
  // Use legacy webpack builder to avoid Turbopack workUnitAsyncStorage issues in Next.js 16
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  
  // Enable AMP mode and experimental optimizations
  experimental: {
    optimizePackageImports: [
      "@radix-ui",
      "@tiptap/react",
      "@tiptap/core",
      "recharts",
    ],
    // Disable scroll restoration to work around Next.js 16 prerendering issues
    // scrollRestoration: true,
    optimizeCss: true, // Optimize CSS loading
    // Disable client trace metadata to avoid workUnitAsyncStorage issues
    clientTraceMetadata: [],
  },

  // Optimize image handling for CDN
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Enable AVIF for modern browsers, fallback to WebP
    formats: ["image/avif", "image/webp"],
    // Aggressive caching for static assets
    minimumCacheTTL: 31536000, // 1 year for hashed files
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Configure device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Configure image sizes for optimization
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // The warning about quality can be addressed by ensuring we have valid quality values
    // But Next.js uses a default quality of 75, and we can't explicitly configure multiple quality values
    // So we'll just remove the invalid property
  },

  // Headers for AMP cache and CDN optimization
  async headers() {
    return [
      {
        // AMP cache optimization headers
        source: "/:path(.*\\.amp\\.html)$",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
          },
          {
            key: "X-Amp-Cache",
            value: "true",
          },
          {
            key: "Vary",
            value: "Accept-Encoding, Accept, X-Accept-Encoding",
          },
        ],
      },
      {
        // Static assets with long TTL for CDN
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "CDN-Cache-Control",
            value: "max-age=31536000",
          },
        ],
      },
      {
        // Pre-rendered pages with shorter TTL
        source: "/:path((?!api|_next).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
          },
          {
            key: "X-Cache-Status",
            value: "HIT",
          },
          {
            key: "Vary",
            value: "Accept-Encoding",
          },
        ],
      },
    ];
  },

  // Rewrites for CDN failover and geographic routing
  async rewrites() {
    return {
      beforeFiles: [
        // Route to appropriate CDN based on path
        {
          source: "/api/cdn/:path*",
          destination: "/api/cdn-proxy?path=/:path*",
        },
      ],
      fallback: [
        // Fallback to secondary CDN if primary fails
        {
          source: "/:path*",
          destination: "/:path*",
        },
      ],
    };
  },

  // Redirects for AMP pages
  async redirects() {
    return [
      {
        source: "/amp/:path*",
        destination: "/:path*",
        permanent: true,
      },
    ];
  },

  webpack: (config, { dev, isServer }) => {
    // Increase chunk load timeout to 30 seconds
    config.output.chunkLoadTimeout = 30000;

    // Improve code splitting to reduce initial bundle size
    if (config.optimization && config.optimization.splitChunks) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Separate framework code
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            name: 'framework',
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          // Separate core libraries
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name: 'lib',
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          // Separate common components
          common: {
            name: 'common',
            minChunks: 2,
            priority: 20,
            reuseExistingChunk: true,
          },
          // Default vendors
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
          },
        }
      };
    }

    // Enable aggressive tree-shaking
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          }
        }
      }
    };

    // Optimize for production builds
    if (!dev && !isServer) {
      // Additional optimizations for client-side code
      config.optimization.minimize = true;
    }

    return config;
  },



  // Compress static files
  compress: true,

  // Enable PoweredBy header removal for security
  poweredByHeader: false,

  // Set production source maps for debugging
  productionBrowserSourceMaps: true,

  // Enable trailing slashes for CDN compatibility
  trailingSlash: false,

  // Revalidate ISR pages
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 60s
    pagesBufferLength: 5,
  },
};

const bundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Skip Sentry config in development to reduce bundle size and improve build speed
// Sentry will still initialize at runtime with deferred loading
const config = process.env.NODE_ENV === 'production' 
  ? withSentryConfig(bundleAnalyzerConfig(nextConfig), {
      org: "personal-0oh",
      project: "javascript-nextjs",
      silent: !process.env.CI,
      widenClientFileUpload: true,
      disableLogger: true,
      automaticVercelMonitors: false, // Disable to reduce overhead
      telemetry: false, // Disable Sentry telemetry
    })
  : bundleAnalyzerConfig(nextConfig);

export default config;