import type { CheckIn, CheckOut } from '../Utility/types/AccessControl.js';
import type { Member } from '../Utility/types/Member.js';
import { SettingsEngine } from './Settings.js';
import { StorageEngine } from './Storage.js';
import { assertGuardEquals } from 'typia';

/** Engine responsible for managing access control operations, the main business logic for the app. */
export class AccessControlEngine {
    /** Instance of the AccessControlEngine singleton. */
    static #instance: AccessControlEngine | undefined = void 0;
    /** Instance of the StorageEngine used by the AccessControlEngine. */
    #storageEngine: StorageEngine;
    /** Instance of the settings engine used to retrieve the current system settings. */
    #settingsEngine: SettingsEngine;

    // #region Initialization

    /**
     * Initializes the properties and state of the StorageEngine.
     * @param storageEngine Instance of the StorageEngine to use for the AccessControlEngine's operations, required for dependency injection.
     */
    private constructor(storageEngine: StorageEngine) {
        // #region Input Validation
        if (!(storageEngine instanceof StorageEngine)) { throw new TypeError('The provided storage engine is not an instance of the StorageEngine class!', { 'cause': 'Input validation!' }); }
        // #endregion Input Validation

        // Store a copy of the storage engine for later use
        this.#storageEngine = storageEngine;

        // Store a copy of the settings engine for later use
        this.#settingsEngine = SettingsEngine.getInstance();
    }

    /**
     * Initializes the singleton instance if not already and then returns the instance.
     * @returns Instance of the singleton class.
     */
    public static async getInstance(): Promise<AccessControlEngine> {
        /** Check if the singleton instance is initialized, and initialize it if it isn't. */
        if (typeof this.#instance === 'undefined') {
            /** Instance of the StorageEngine used by the AccessControlEngine. */
            const storageEngine = await StorageEngine.getInstance();

            // Finish loading the access control engine's properties and state after the storage engine is loaded, as it is a dependency for the access control engine.
            this.#instance = new AccessControlEngine(storageEngine);
        }

        // If the instance is already initialized, return it to the caller.
        return this.#instance;
    }

    /**
     * Resets the singleton instance to an uninitialized state.
     * @deprecated This is used for testing purposes to ensure that each test can start with a clean slate.
     */
    public static clearInstance(): void { this.#instance = void 0; }

    // #endregion Initialization

    // #region Business Logic

    /**
     * Checks a registered member into the facility when they have a legal form signature on file and are not already checked in.
     * @param memberId Unique identifier of the member being checked in.
     * @param reason List of activities the member is checking in for.
     * @param actor Unique identifier of the principal initiating the check-in, defaults to the member being checked in.
     * @returns Created check-in audit record.
     */
    async checkIn(memberId: Member['id'], reason: CheckIn['activity'], actor?: CheckIn['initiatingActor']): Promise<CheckIn> {
        // #region Input Validation
        assertGuardEquals(memberId);

        assertGuardEquals(reason);

        assertGuardEquals(actor);
        // #endregion Input Validation

        /** Registered member record loaded from persistent storage. */
        let member: Member | undefined = void 0;

        // Gracefully attempt to load the member so a missing member becomes a business-rule error instead of a raw storage error.
        try { member = await this.#storageEngine.getMember(memberId); } catch (error) { throw new RangeError('The requested member does not exist!', { 'cause': 'Input validation!' }); }

        /** Last log entry for the member, which could be a check-in or check-out record. */
        const lastLogEntry = member.lastLogEntry ? await this.#storageEngine.getCheckInOutLogs(member.lastLogEntry) : void 0;

        // Block duplicate check-ins when the member already has a check-in record that has not yet been checked out.
        if (lastLogEntry?.type === 'check-in') { throw new RangeError('The member cannot be checked in because they are already checked in.', { 'cause': 'Input operation!' }); }

        /** Working list of forms that need to be signed by the member to complete the check-in process. */
        const requiredSignatureList = [...this.#settingsEngine.currentSettings.requiredFormList];

        // Iterate through each signature until signature validation is complete.
        for (const signatureId of member.signatureList) {
            /** Current signature loaded from persistent storage. */
            const signature = await this.#storageEngine.getSignature(signatureId);

            /** Instance of the form that was signed by the member. */
            const formVersion = await this.#storageEngine.getLegalFormVersion(signature.formVersionId);

            /** Snapshot of the current date, to be used for comparison for expiration and not before values. */
            const currentDate = new Date();

            // Skip the current signature if the form version it is associated with is not yet active
            // eslint-disable-next-line no-continue
            if (formVersion.notBefore && currentDate < new Date(formVersion.notBefore)) { continue; }

            // Skip the current signature if the form version it is associated with is expired
            // eslint-disable-next-line no-continue
            if (formVersion.expiration && currentDate > new Date(formVersion.expiration)) { continue; }

            /** Index location of the form in the required signature list, if present. */
            const indexLocation = requiredSignatureList.indexOf(formVersion.formId);

            // Remove the signature from the required signature list if it is valid and present
            if (indexLocation !== -1) { requiredSignatureList.splice(indexLocation, 1); }

            // Stop execution of the loop early since signature validation is successful
            if (requiredSignatureList.length === 0) { break; }
        }

        // Block the check-in if the member does not have a stored legal form signature.
        if (requiredSignatureList.length !== 0) { throw new RangeError('No signature on file!', { 'cause': 'Input validation!' }); }

        /** Newly created check-in audit record in persistent storage. */
        const checkInRecord = await this.#storageEngine.newCheckIn(memberId, reason, actor ?? memberId);

        // Update the member's last log entry to the created check-in record for quick reference to the member's latest access control state.
        member.lastLogEntry = checkInRecord.id;

        // Add the created check-in record ID to the member record for direct member history access.
        member.checkInLogList.push(checkInRecord.id);

        // Persist the updated member record with the new check-in history link.
        await this.#storageEngine.newMember(member);

        // Return the created check-in audit record to the caller.
        return checkInRecord;
    }

    /**
     * Checks a registered member out of the facility when their latest access-control state is checked in.
     * @param memberId Unique identifier of the member being checked out.
     * @param actor Unique identifier of the principal initiating the check-out, defaults to the member being checked out.
     * @returns Created check-out audit record.
     */
    async checkOut(memberId: Member['id'], actor?: CheckOut['initiatingActor']): Promise<CheckOut> {
        // #region Input Validation
        assertGuardEquals(memberId);

        assertGuardEquals(actor);
        // #endregion Input Validation

        /** Registered member record loaded from persistent storage. */
        let member: Member | undefined = void 0;

        // Gracefully attempt to load the member so a missing member becomes a business-rule error instead of a raw storage error.
        try { member = await this.#storageEngine.getMember(memberId); } catch (error) { throw new Error('The member cannot be checked out because they are not registered.', { 'cause': error }); }

        /** Last log entry for the member, which could be a check-in or check-out record. */
        const lastLogEntry = member.lastLogEntry ? await this.#storageEngine.getCheckInOutLogs(member.lastLogEntry) : void 0;

        // Block duplicate check-ins when the member already has a check-in record that has not yet been checked out.
        if (lastLogEntry?.type !== 'check-in') { throw new RangeError('The member cannot be checked out because they are not already checked in.', { 'cause': 'Input operation!' }); }

        /** Created check-out audit record ID from persistent storage. */
        const checkOutRecord = await this.#storageEngine.newCheckOut(memberId, lastLogEntry.id, actor ?? memberId);

        // Update the member's last log entry to the created check-out record for quick reference to the member's latest access control state.
        member.lastLogEntry = checkOutRecord.id;

        // Add the created check-out record ID to the member record for direct member history access.
        member.checkOutLogList.push(checkOutRecord.id);

        // Persist the updated member record with the new check-out history link.
        await this.#storageEngine.newMember(member);

        // Return the created check-out audit record to the caller.
        return checkOutRecord;
    }

    // #endregion Business Logic
}
