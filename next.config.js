// // Next.js configuration
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'api.slingacademy.com',
//         port: ''
//       }
//     ]
//   },
//   transpilePackages: ['geist']
// };

// export default nextConfig;


// // Injected content via Sentry wizard below

// import { withSentryConfig } from "@sentry/nextjs";




// export default withSentryConfig(nextConfig, {
//   // For all available options, see:
//   // https://www.npmjs.com/package/@sentry/webpack-plugin#options

//   org: "tech-samrajy",
//   project: "javascript-nextjs",

//   // Only print logs for uploading source maps in CI
//   silent: !process.env.CI,

//   // For all available options, see:
//   // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

//   // Upload a larger set of source maps for prettier stack traces (increases build time)
//   widenClientFileUpload: true,

//   // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
//   // Note: Check that this route does not collide with your middleware.
//   tunnelRoute: "/monitoring",

//   // Automatically tree-shake Sentry logger statements to reduce bundle size
//   disableLogger: true,

//   // Enables automatic instrumentation of Vercel Cron Monitors
//   automaticVercelMonitors: true,
// });



// Next.js configuration
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.onegred.com",
        port: "",
      },
    ],
  },
  transpilePackages: ["geist"],
  // Improve HMR (Hot Module Replacement)
  reactStrictMode: true,
  // Optimize for development
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Aggressive file watching for Windows
      config.watchOptions = {
        poll: 1000, // Poll every second for file changes
        aggregateTimeout: 300, // Wait 300ms before rebuilding
        ignored: ['**/node_modules', '**/.next'],
      };
      
      // Enable better HMR
      config.infrastructureLogging = {
        level: 'error',
      };
      
      // Ensure HMR works properly
      if (!isServer) {
        config.optimization = {
          ...config.optimization,
          moduleIds: 'named',
        };
      }
    }
    return config;
  },
};

import { withSentryConfig } from "@sentry/nextjs";

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "tech-samrajy",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // Note: Check that this route does not collide with your middleware.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
});


// Injected content via Sentry wizard below
