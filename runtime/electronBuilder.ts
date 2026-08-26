import type { Configuration } from 'electron-builder';
import packageConfig from './package.json' with { 'type': 'json' };

/** Electron compile settings used to convert the compiled files to platform binaries. */
const builderConfig: Configuration = {
    'appId': 'me.huffman.elliot.check-in',
    'buildVersion': '1.0.0',
    'copyright': 'Copyright © 2026 Elliot Huffman',
    'directories': { 'output': '../dist/' },
    'electronFuses': {
        'enableCookieEncryption': true,
        'enableEmbeddedAsarIntegrityValidation': true,
        'enableNodeCliInspectArguments': false,
        'enableNodeOptionsEnvironmentVariable': false,
        'grantFileProtocolExtraPrivileges': false,
        // 'loadBrowserProcessSpecificV8Snapshot': true,
        'onlyLoadAppFromAsar': true,
        'runAsNode': false
    },
    'electronVersion': packageConfig.devDependencies.electron.replace('~', ''),
    'executableName': 'Check-In',
    'files': [
        'bin/',
        '!bin/tsconfig.tsbuildinfo',
        {
            'from': '../user-interface/out/client/',
            'to': 'user-interface/out/client/'
        }
    ],
    'productName': 'Elliot Huffman\'s - Check-In',
    'protocols': {
        'name': 'Elliot Huffman\'s - Check-In',
        'schemes': ['elhuff-check-in']
    },
    'win': {
        'compression': 'maximum',
        'icon': '../assets/Logo.ico',
        'target': [
            {
                'arch': [
                    'x64',
                    'arm64'
                ],
                'target': 'dir'
            }
        ]
    }
};

// Expose the configuration to be used by electron-builder when compiling the binaries.
export default builderConfig;
