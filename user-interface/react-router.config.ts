import type { Config } from '@react-router/dev/config';

/** React Router's framework mode configuration. */
const frameworkConfig: Config = {
    'appDirectory': './src',
    'buildDirectory': './out',
    'splitRouteModules': 'enforce',
    'ssr': false
};

// Export the framework configuration for React Router so that the compiler can use it.
export default frameworkConfig;
