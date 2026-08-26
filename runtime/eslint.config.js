import { defineConfig } from 'eslint/config';
import { eslintConfig } from '@software-hardware-integration-lab/development-utilities/optimized/lint/base.js';

// Linting configuration used for the runtime and UI as defined by SHI.
export default defineConfig([
    ...eslintConfig.map((config) => ({
        ...config,
        'files': ['**/*.{ts,js}']
    }))
]);
