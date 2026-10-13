import { checkInPageSlice } from './slices/pages/checkIn';
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { themeProviderSlice } from './slices/themeProvider';
import { userDataSlice } from './slices/elements/userData';

/** Global metadata store to be used across all pages in the same browser memory instance. */
export const store = configureStore({
    'reducer': {
        'checkInPage': checkInPageSlice.reducer,
        'themeProvider': themeProviderSlice.reducer,
        'userData': userDataSlice.reducer
    }
});

// Integrate RTK query into the store, in a react optimized mode
setupListeners(store.dispatch);

/** Shape of the global redux store. */
export type RootState = ReturnType<typeof store.getState>;
