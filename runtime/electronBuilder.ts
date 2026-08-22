import type { Configuration } from "electron-builder";
import packageConfig from "./package.json" with { 'type': "json" };

/** Electron compile settings used to convert the compiled files to platform binaries. */
const builderConfig: Configuration = {
    'appId': 'me.huffman.elliot.check-in',
    'productName': 'Elliot Huffman\'s - Check-In',
    'copyright': 'Copyright © 2026 Elliot Huffman',
    'buildVersion': '1.0.0',
    'executableName': 'Check-In',
    'electronVersion': packageConfig.devDependencies.electron.replace('~', ''),
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
    'directories': {
        'output': '../dist/'
    },
    'files': [
        "bin/",
        "!bin/tsconfig.tsbuildinfo",
        {
            'from': '../user-interface/out/client/',
            'to': 'user-interface/out/client/'
        }
    ],
    'protocols': {
        'name': 'Elliot Huffman\'s - Check-In',
        'schemes': ['elhuff-check-in']
    },
    'win': {
        'compression': 'maximum',
        'icon': '../assets/Logo.ico',
        'target': [
            {
                'target': 'dir',
                'arch': [
                    'x64',
                    'arm64'
                ]
            }
        ]
    }
};

// Expose the configuration to be used by electron-builder when compiling the binaries.
export default builderConfig;
