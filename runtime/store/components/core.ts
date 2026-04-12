'use client';

import { join, normalize } from 'node:path';
import type { RootState } from '../store.js';
import { createSlice } from '@reduxjs/toolkit';
import { app as electron } from 'electron';

/** Structure of the slice's state. */
interface CoreState {
    /** Directory where system-wide operational data is stored. */
    'appDataDirectory': string;
    /** Directory where user-specific settings are stored. */
    'settingsFile': string;
}

/** Default set of data that the slice will use upon initialization. */
const initialState: CoreState = {
    'appDataDirectory': normalize(electron.getPath('userData')),
    'settingsFile': join(electron.getPath('userData'), 'settings.json')
};

/** Section of the global metadata store related to theme management. */
export const coreSlice = createSlice({
    initialState,
    'name': 'Core App Configuration',
    'reducers': {}
});

// #region Selectors

/**
 * Retrieves the current theme mode from the global metadata store.
 * @param state Snapshot of an instance of the global metadata store to retrieve the data point from.
 * @returns Extracted value of the specific property in the global metadata store.
 */
export function appDataDirectorySelector(state: RootState): CoreState['appDataDirectory'] {
    // Return the specific global state value
    return state.core.appDataDirectory;
}

/**
 * Retrieves the current settings file path from the global metadata store.
 * @param state Snapshot of an instance of the global metadata store to retrieve the data point from.
 * @returns Extracted value of the specific property in the global metadata store.
 */
export function settingsFileSelector(state: RootState): CoreState['settingsFile'] {
    // Return the specific global state value
    return state.core.settingsFile;
}

// #endregion Selectors

// Export the reducers

// Export const { } = authenticationSlice.actions;
