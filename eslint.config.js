import { defineConfig, globalIgnores } from 'eslint/config';
import { eslintConfig as baseConfig } from '@shi-corp/development-utilities/optimized/lint/base.js';
import { eslintConfig as nextConfig } from '@shi-corp/development-utilities/optimized/lint/next.js';

// Linting configuration used for the runtime and UI as defined by SHI.
export default defineConfig([
    globalIgnores([
        'user-interface/.next/**',
        'user-interface/out/**',
        'user-interface/public/**'
    ]),
    ...baseConfig.map(config => ({ ...config, 'files': ['runtime/**/*.{ts,js}'] })),
    ...nextConfig.map(config => ({ ...config, 'files': ['user-interface/**/*.{ts,js,tsx}'] })),
]);
