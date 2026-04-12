import type { NextConfig } from 'next';

/** Configurations used for the Next.js compiler. */
const nextConfig: NextConfig = {
    // Ensure that the output folder is cleaned before each build to prevent stale files from persisting.
    'cleanDistDir': true,
    // Compile to static HTML files for external integration
    'output': 'export',
    // Auto optimize code so that the UI looks more like native JS instead of react hook code.
    'reactCompiler': true,
    // Enable an additional layer of logical checks and warnings in development mode to help identify potential issues early on.
    'reactStrictMode': true,
    // Ensure that all generated URLs end with a trailing slash, which can help with consistent URL structure for static hosting.
    'trailingSlash': true
};

// Export the configuration object so that Next.js can use it during the build and development processes.
export default nextConfig;
