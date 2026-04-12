'use client';

import { configureStore } from '@reduxjs/toolkit';
import { coreSlice } from './components/core.js';

/** Global metadata store to be used across all pages in the same browser memory instance. */
export const store = configureStore({
    'reducer': {
        'core': coreSlice.reducer
    }
});

/** Shape of the global redux store. */
export type RootState = ReturnType<typeof store.getState>;
