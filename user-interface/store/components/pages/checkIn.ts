'use client';

import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

/** Structure of the slice's state. */
interface CheckInPageState {
    /** Current value of the check-in input field. */
    'inputValue': string;
}

/** Default set of data that the slice will use upon initialization. */
const initialState: CheckInPageState = {
    'inputValue': ''
};

/** Section of the global metadata store related to check-in input. */
export const checkInPageSlice = createSlice({
    initialState,
    'name': 'Page - Check In',
    'reducers': {
        /**
         * Sets the current check-in input value in the global metadata store.
         * @param state Mutable slice state.
         * @param action Payload describing the next input value.
         */
        'setInputValue': (state, action: PayloadAction<string>): void => { state.inputValue = action.payload; }
    }
});

/**
 * Retrieves the current check-in input value from the global metadata store.
 * @param state Snapshot of an instance of the global metadata store to retrieve the data point from.
 * @returns Extracted value of the specific property in the global metadata store.
 */
export function checkInInputSelector(state: RootState): CheckInPageState['inputValue'] {
    // Return the current value of the check-in input field from the global metadata store.
    return state.checkInPage.inputValue;
}

/** Exposes the slice actions for check-in input updates. */
export const {
    setInputValue
} = checkInPageSlice.actions;
