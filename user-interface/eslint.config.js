import { defineConfig, globalIgnores } from 'eslint/config';
import { eslintConfig as baseConfig } from '@software-hardware-integration-lab/development-utilities/optimized/lint/next.js';

// Linting configuration used for the runtime and UI as defined by SHI.
export default defineConfig([
    globalIgnores([
        '.react-router/**',
        'out/**',
        'public/**'
    ]),
    ...baseConfig.map((config) => ({
        ...config,
        'files': ['**/*.{ts,js,tsx}']
    }))
]);
