import babel from '@rolldown/plugin-babel';
import { defineConfig } from 'vite';
import { griffel } from '@griffel/vite-plugin';
import { reactCompilerPreset } from '@vitejs/plugin-react';
import { reactRouter } from '@react-router/dev/vite';
import { resolve } from 'node:path';

// Configure Vite.js
export default defineConfig(({ command }) => ({
    'optimizeDeps': { 'exclude': ['react-router'] },
    'plugins': [
        // Ensure that when in test mode, the react router framework is not loaded, as it will cause issues with the test runner.
        !process.env['VITEST'] && reactRouter(),

        // Enable react compiler for auto optimization
        babel({ 'presets': [reactCompilerPreset()] }),

        // If the production build is being run, then run the Griffel.js pre-compiler plugin to generate the optimized css files for the components.
        command === 'build' && griffel()
    ],
    'resolve': {
        'alias': {
            '@': resolve(import.meta.dirname, './src'),
            '@/public': resolve(import.meta.dirname, './public')
        }
    },
    // Tabster is CommonJS but Fluent UI imports it through ESM named exports during SSR.
    'server': { 'port': 3000 },
    'ssr': { 'noExternal': [/^@fluentui\//u, 'tabster'] }
}));
