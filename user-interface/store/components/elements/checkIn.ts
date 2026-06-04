'use client';

import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

/** Structure of the slice's state. */
interface CheckInState {
    /**
     * Current value of the check-in input field.
     * @default ""
     */
    'inputValue': string;
}

/** Default set of data that the slice will use upon initialization. */
const initialState: CheckInState = {
    'inputValue': ''
};

/** Section of the global metadata store related to check-in input. */
export const checkInSlice = createSlice({
    initialState,
    'name': 'Check In',
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
export function checkInInputSelector(state: RootState): string {
    return state.checkIn.inputValue;
}

/** Exposes the slice actions for check-in input updates. */
export const {
    setInputValue
} = checkInSlice.actions;
