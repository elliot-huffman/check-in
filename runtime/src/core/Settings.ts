import { type DeepReadonly, deepFreeze } from '../Utility/deepFreeze.js';
import { access, constants, mkdir, readFile, writeFile } from 'node:fs/promises';
import { assertGuardEquals, json } from 'typia';
import type { CurrentSettings } from '../Utility/types/Settings.js';
import { NULL_UUID } from '../store/constants/core.js';
import { app as electron } from 'electron';
import { join } from 'node:path';

/** Engine responsible for managing persisted application settings. */
export class SettingsEngine {
    /** Instance of the SettingsEngine singleton. */
    static #instance: SettingsEngine | undefined = void 0;
    /** Path to the directory where the settings file is stored and other data can be stored. */
    public appDataPath: string;
    /** Current settings for the application. These are stored on non-volatile memory. Loaded at startup. */
    #currentSettings: DeepReadonly<CurrentSettings>;
    /** Indicates whether the settings are currently being loaded. */
    public isLoading: Promise<void>;
    /** Flag that indicates if the settings are currently being saved. */
    #isSaving: boolean;
    /** Name of the settings file to ensure consistency across the settings engine. */
    #settingsFileName: string;

    // #region Initialization

    /** Initializes the properties and state of the SettingsEngine. */
    private constructor() {
        // Initialize the current settings with default values. These will be overwritten once the actual settings are loaded.
        this.#currentSettings = {
            'activityList': [],
            'checkInLogFolderPath': void 0,
            'clientId': NULL_UUID,
            'memberFolderPath': void 0,
            'requiredFormList': [],
            'signatureFolderPath': void 0,
            'tenantId': 'common',
            'version': 1
        };

        // Set the setting file name to ensure consistency across the class and avoid magic strings.
        this.#settingsFileName = 'settings.json';

        // Determine the path to the application data directory, using ProgramData on Windows and the appropriate app data path on other platforms.
        this.appDataPath = join(process.env['ProgramData'] ?? electron.getPath('appData'), electron.getName());

        // Start the load process for the current settings immediately upon instantiation.
        this.isLoading = this.#loadSettings();

        // Initialize the saving flag to false since we are not currently saving when the class is instantiated.
        this.#isSaving = false;
    }

    /**
     * Retrieves the singleton instance of the SettingsEngine.
     * If the instance does not exist, it creates a new one.
     * @returns The singleton instance of the SettingsEngine.
     */
    public static getInstance(): SettingsEngine {
        // Check if the singleton instance already exists. If not, create it.
        if (SettingsEngine.#instance === void 0) { SettingsEngine.#instance = new SettingsEngine(); }

        // Return the singleton instance of the SettingsEngine.
        return SettingsEngine.#instance;
    }

    /**
     * Resets the singleton instance of this class.
     * This is useful for testing purposes or if you need to reinitialize the settings during runtime.
     * @deprecated This method is intended for testing and should not be used in production code.
     */
    public static clearInstance(): void { SettingsEngine.#instance = void 0; }

    /**
     * Retrieves the current settings in a deeply readonly format to prevent modification.
     * @returns The current settings of the settings engine which is a deeply readonly object to prevent tamper.
     */
    // eslint-disable-next-line @typescript-eslint/related-getter-setter-pairs
    get currentSettings(): DeepReadonly<CurrentSettings> { return this.#currentSettings; }

    /** Updates the current settings with new values. */
    set currentSettings(newSettings: CurrentSettings) {
        // #region Input validation
        assertGuardEquals(newSettings);
        // #endregion Input validation

        // Update the current settings in memory with the new settings.
        this.#currentSettings = deepFreeze(newSettings);

        // Save the updated settings to disk.
        void this.#saveSettings();
    }

    // #endregion Initialization

    /** Loads settings from disk when present and leaves defaults in place when the file is absent or invalid. */
    async #loadSettings(): Promise<void> {
        // Create the folder if it doesn't exist
        try {
            // Check if the folder is available to the app.
            await access(this.appDataPath, constants.F_OK);
        } catch (_error) {
            // Create the folder structure if it doesn't exist.
            await mkdir(this.appDataPath, { 'recursive': true });
        }

        // Attempt to load the settings from disk, and if it fails, create a new settings file with the defaults.
        try {
            // Check if access to the settings is present before attempting to read it
            await access(join(this.appDataPath, this.#settingsFileName), constants.F_OK);

            /** Raw text data straight from the settings file to be validated (untrusted). */
            const rawSettingsContent = await readFile(join(this.appDataPath, this.#settingsFileName), 'utf8');

            // Validate the settings file's contents and parse it into the currentSettings property if valid.
            this.#currentSettings = json.assertParse<CurrentSettings>(rawSettingsContent);
        } catch (_error) {
            // Write the default settings to disk if the file doesn't exist or is invalid
            await writeFile(join(this.appDataPath, this.#settingsFileName), json.stringify(this.#currentSettings), 'utf8');
        }
    }

    /** Saves the current settings to ProgramData as a JSON document. */
    async #saveSettings(): Promise<void> {
        // If a save operation is already in progress, we should not start another one
        if (this.#isSaving) { return; }

        // Set the saving flag to true to indicate that a save operation is in progress
        this.#isSaving = true;

        // Guarantee that the save flag is reset in the case of any error
        try {
            // Create the folder if it doesn't exist to ensure valid write path
            await mkdir(this.appDataPath, { 'recursive': true });

            /** Serialized JSON representation of the current settings. */
            const serializedSettings = json.stringify(this.#currentSettings);

            // Write the settings to disk, overwriting any existing settings file.
            await writeFile(join(this.appDataPath, this.#settingsFileName), serializedSettings, 'utf8');
        } finally {
            // Reset the saving flag to false after the save operation is complete, regardless of success or failure
            this.#isSaving = false;
        }
    }
}
