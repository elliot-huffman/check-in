export declare global {
    // eslint-disable-next-line jsdoc/require-jsdoc
    interface Window {
        /** IPC (Inter-Process Communication) API exposed by Electron. */
        'electronApi': {
            /**
             * Starts the login process for the runtime to get the end user authenticated.
             * @returns Promise that indicates if the logged process has completed or not.
             */
            'login': () => Promise<void>;
            /**
             * Starts the logout process for the runtime to get the end user signed out.
             * @returns Promise that indicates if the logout process has completed or not.
             */
            'logout': () => Promise<void>;
        };
    }
}
