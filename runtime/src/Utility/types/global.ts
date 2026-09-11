import type { BrowserWindow } from 'electron';

/** Container for references to application windows used by electron. */
export interface WindowReference {
    /** Reference to the main application window. */
    'mainWindow': InstanceType<typeof BrowserWindow> | null;
}
