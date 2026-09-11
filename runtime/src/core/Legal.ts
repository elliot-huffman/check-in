import type { LegalFormDraft, LegalForm as LegalFormFamily, LegalFormSignature, LegalFormSignatureDraft, LegalFormVersion, LegalFormVersionDraft } from '../Utility/types/Legal.js';
import type { LanguageCodes } from '../Utility/types/i18n.js';
import type { Member } from '../Utility/types/Member.js';
import { StorageEngine } from './Storage.js';
import { assertGuardEquals } from 'typia';
import { randomUUID } from 'node:crypto';

/** Engine responsible for managing legal signatures and forms. */
export class LegalEngine {
    /** Instance of the LegalSignatureEngine singleton. */
    static #instance: LegalEngine | undefined = void 0;
    /** Instance of the StorageEngine used by the LegalSignatureEngine. */
    #storageEngine: StorageEngine;

    // #region Initialization

    /**
     * Initializes the properties and state of the StorageEngine.
     * @param storageEngine Instance of the StorageEngine to use for the LegalEngine's operations, required for dependency injection.
     */
    private constructor(storageEngine: StorageEngine) {
        // #region Input Validation
        if (!(storageEngine instanceof StorageEngine)) { throw new TypeError('The provided storage engine is not an instance of the StorageEngine class!', { 'cause': 'Input validation!' }); }
        // #endregion Input Validation

        // Store a copy of the storage engine for later use
        this.#storageEngine = storageEngine;
    }

    /**
     * Initializes the singleton instance if not already and then returns the instance.
     * @returns Instance of the singleton class.
     */
    public static async getInstance(): Promise<LegalEngine> {
        /** Check if the singleton instance is initialized, and initialize it if it isn't. */
        if (typeof this.#instance === 'undefined') {
            /** Instance of the StorageEngine used by the AccessControlEngine. */
            const storageEngine = await StorageEngine.getInstance();

            // Finish loading the legal engine's properties and state after the storage engine is loaded, as it is a dependency for the legal engine.
            this.#instance = new LegalEngine(storageEngine);
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
     * Creates or updates a legal form family record and returns the stored legal form.
     * @param formDraft Legal form family metadata to persist.
     * @param formId Optional unique identifier to use when creating a new legal form family.
     * @returns The stored immutable legal form family record.
     */
    public async newForm(formDraft: LegalFormDraft, formId?: LegalFormFamily['id']): Promise<LegalFormFamily> {
        // #region Input Validation
        assertGuardEquals(formDraft);

        assertGuardEquals(formId);
        // #endregion Input Validation

        /** New state of the new or existing legal form family. */
        const computedForm: LegalFormFamily = {
            ...formDraft,
            'id': formId ?? randomUUID()
        };

        // Operate on a single form if a Form ID is provided
        if (formId) {
            /** Existing legal form family loaded from persistent storage to update. */
            let existingForm: LegalFormFamily | undefined = void 0;

            // Attempt retrieval of the specified legal form
            try { existingForm = await this.#storageEngine.getLegalForm(formId); } catch (_error) { /* Do nothing */ }

            // Ensure that that the form exists before attempting to update it, otherwise the provided form ID is invalid.
            if (!existingForm) { throw new RangeError('The provided form ID does not exist already!', { 'cause': 'Input validation!' }); }

            // Update the ID of the form to match the existing form
            computedForm.id = existingForm.id;

            return await this.#storageEngine.newLegalForm(computedForm);
        }

        // Create a new legal form family.
        return await this.#storageEngine.newLegalForm(computedForm);
    }

    /**
     * Publishes a new legal form version for an existing legal form family.
     * @param formId Unique identifier of the legal form family receiving the new version.
     * @param formDraft Versioned legal form content to publish.
     * @returns The stored immutable legal form version record.
     */
    public async newFormVersion(formId: LegalFormFamily['id'], formDraft: LegalFormVersionDraft): Promise<LegalFormVersion> {
        // #region Input Validation
        assertGuardEquals(formId);

        assertGuardEquals(formDraft);

        /** Existing legal form family loaded from persistent storage. */
        let existingForm: LegalFormFamily | undefined = void 0;

        // Load the existing legal form family so the new version can be linked correctly.
        try { existingForm = await this.#storageEngine.getLegalForm(formId); } catch (_error) { throw new RangeError('The requested legal form family does not exist!', { 'cause': 'Input validation!' }); }

        // Ensure that content is present before making a new version
        if (Object.keys(formDraft.content).length === 0) { throw new RangeError('The legal form must contain at least one language variant.', { 'cause': 'Input validation!' }); }

        // Iterate through each language variation provided to ensure the content is in the correct format
        for (const languageCode in formDraft.content) {
            // Ensure that prototypes are ignored
            // eslint-disable-next-line no-continue
            if (!Object.hasOwn(formDraft.content, languageCode)) { continue; }

            /** Legal form content for the current language variant. */
            const content = formDraft.content[languageCode as LanguageCodes];

            // Ensure that the provided legal form version's content is not blank
            if (!content.trim()) { throw new RangeError(`The legal form content for ${ languageCode } cannot be empty.`, { 'cause': 'Input validation!' }); }
        }

        // #endregion Input Validation

        /** Current published legal form version loaded from persistent storage, if one exists. */
        const previousFormVersion = existingForm.currentVersionId === null
            ? null
            : await this.#storageEngine.getLegalFormVersion(existingForm.currentVersionId);

        /** Immutable legal form version record that will be stored for signature workflows. */
        const newFormVersion: LegalFormVersion = {
            'content': formDraft.content,
            'createdAt': new Date().toISOString(),
            'description': existingForm.description.trim(),
            'displayName': existingForm.displayName.trim(),
            'expiration': formDraft.expiration,
            'formId': existingForm.id,
            'id': randomUUID(),
            'notBefore': formDraft.notBefore,
            'previousVersionId': previousFormVersion?.id ?? null,
            'signatureList': [],
            'version': (previousFormVersion?.version ?? 0) + 1
        };

        // Add the new form version to the ordered ID list
        existingForm.versionList.push(newFormVersion.id);

        /** Updated legal form family metadata after publishing the new version. */
        const storedForm: LegalFormFamily = {
            ...existingForm,
            'currentVersionId': newFormVersion.id,
            'versionList': existingForm.versionList
        };

        // Persist the immutable version record before updating the family metadata so the family never points at a missing version.
        await this.#storageEngine.newLegalFormVersion(newFormVersion);

        // Persist the legal form family metadata with the updated current version information.
        await this.#storageEngine.newLegalForm(storedForm);

        // Return the created legal form version record to the caller.
        return newFormVersion;
    }

    /**
     * Adds new language variants to an existing legal form version without allowing previously stored languages to change.
     * @param id Unique identifier of the legal form version to update.
     * @param formVersionDraft Additional language variants to append to the stored version.
     * @returns The updated legal form version record.
     */
    public async updateFormVersion(id: LegalFormVersion['id'], formVersionDraft: LegalFormVersionDraft): Promise<LegalFormVersion> {
        // #region Input Validation
        assertGuardEquals(id);

        assertGuardEquals(formVersionDraft);
        // #endregion Input Validation

        /** Existing legal form version loaded from persistent storage. */
        const existingFormVersion = await this.#storageEngine.getLegalFormVersion(id);

        // Safely integrate the new lang code into the existing content while forcing existing content to not be updated
        existingFormVersion.content = {
            ...formVersionDraft.content,
            ...existingFormVersion.content
        };

        /** Object representation of what was just saved to persistent storage. */
        const mutationResults = await this.#storageEngine.newLegalFormVersion(existingFormVersion);

        // Return the updated legal form version record to the caller.
        return mutationResults;
    }

    /**
     * Removes a legal form version when it has no signatures on file and no newer version depends on it.
     * @param id Unique identifier of the legal form version to remove.
     */
    public async removeFormVersion(id: LegalFormVersion['id']): Promise<void> {
        // #region Input Validation
        assertGuardEquals(id);
        // #endregion Input Validation

        /** Requested legal form version loaded from persistent storage. */
        let legalFormVersion: LegalFormVersion | undefined = void 0;

        // Gracefully attempt to load the legal form version so a missing version becomes a business-rule error instead of a raw storage error.
        try { legalFormVersion = await this.#storageEngine.getLegalFormVersion(id); } catch (_error) { throw new RangeError('The requested legal form version does not exist!', { 'cause': 'Input validation!' }); }

        // Signed versions are evidentiary records and must remain retained.
        if (legalFormVersion.signatureList.length !== 0) { throw new RangeError('The legal form version cannot be removed because signatures are on file.', { 'cause': 'Input operation!' }); }

        /** Legal form family loaded from persistent storage. */
        const legalFormFamily = await this.#storageEngine.getLegalForm(legalFormVersion.formId);

        // Prevent removing a version that newer published content still references in its version chain.
        for (const versionId of legalFormFamily.versionList) {
            // Don't process the version that is being removed since it may be the head of the version chain and thus legitimately have no newer version depending on it.
            if (versionId !== legalFormVersion.id) {
                /** Stored legal form version that may depend on the requested version. */
                const candidateVersion = await this.#storageEngine.getLegalFormVersion(versionId);

                // Ensure the correct order of version deletion occurs, only forms with no children can be deleted
                if (candidateVersion.previousVersionId === legalFormVersion.id) { throw new RangeError('The legal form version cannot be removed because a newer version depends on it.', { 'cause': 'Input operation!' }); }
            }
        }

        // Remove the current version's ObjectID from the list of object IDs.
        legalFormFamily.versionList = legalFormFamily.versionList.filter((versionId) => versionId !== legalFormVersion.id);

        // Update the legal form family metadata to remove the deleted version from the version list and update the current version if the removed version was the head of the version chain.
        legalFormFamily.currentVersionId = legalFormVersion.previousVersionId;

        // Persist the updated family metadata before deleting the version file so the family never references a removed version.
        await this.#storageEngine.newLegalForm(legalFormFamily);

        // Delete the requested legal form version now that the family metadata no longer references it.
        await this.#storageEngine.removeLegalFormVersion(legalFormVersion.id);
    }

    /**
     * Retrieves a specific legal form family.
     * @param id Unique identifier of the legal form family to retrieve.
     * @returns The requested legal form family.
     */
    public async getForm(id: LegalFormFamily['id']): Promise<LegalFormFamily>;

    /**
     * Retrieves every legal form family.
     * @returns List of stored legal form families.
     */
    public async getForm(): Promise<LegalFormFamily[]>;

    /**
     * Retrieves one legal form family by ID or all legal form families when no ID is provided.
     * @param id Optional unique identifier of the legal form family to retrieve.
     * @returns The requested legal form family or the full list of legal form families.
     */
    public async getForm(id?: LegalFormFamily['id']): Promise<LegalFormFamily | LegalFormFamily[]> {
        // #region Input Validation
        assertGuardEquals(id);
        // #endregion Input Validation

        // Return all legal form families when no specific form is requested.
        if (!id) { return this.#storageEngine.getLegalForm(); }

        // Gracefully attempt to load the legal form family so a missing form becomes a business-rule error instead of a raw storage error.
        try { return await this.#storageEngine.getLegalForm(id); } catch (_error) { throw new RangeError('The requested legal form does not exist!', { 'cause': 'Input validation!' }); }
    }

    /**
     * Retrieves a specific legal form version.
     * @param id Unique identifier of the legal form version to retrieve.
     * @returns The requested legal form version.
     */
    public async getFormVersion(id: LegalFormVersion['id']): Promise<LegalFormVersion>;

    /**
     * Retrieves every legal form version.
     * @returns List of stored legal form versions.
     */
    public async getFormVersion(): Promise<LegalFormVersion[]>;

    /**
     * Retrieves one legal form version by ID or all legal form versions when no ID is provided.
     * @param id Optional unique identifier of the legal form version to retrieve.
     * @returns The requested legal form version or the full list of legal form versions.
     */
    public async getFormVersion(id?: LegalFormVersion['id']): Promise<LegalFormVersion | LegalFormVersion[]> {
        // #region Input Validation
        assertGuardEquals(id);
        // #endregion Input Validation

        // Return all legal form versions when no specific version is requested.
        if (!id) { return this.#storageEngine.getLegalFormVersion(); }

        // Gracefully attempt to load the legal form version so a missing version becomes a business-rule error instead of a raw storage error.
        try { return await this.#storageEngine.getLegalFormVersion(id); } catch (_error) { throw new RangeError('The requested legal form version does not exist!', { 'cause': 'Input validation!' }); }
    }

    /**
     * Deletes a legal form family and every stored version when none of its versions have collected signatures.
     * @param id Unique identifier of the legal form family to delete.
     */
    public async removeForm(id: LegalFormFamily['id']): Promise<void> {
        // #region Input Validation
        assertGuardEquals(id);
        // #endregion Input Validation

        /** Requested legal form family loaded from persistent storage. */
        let legalForm: LegalFormFamily | undefined = void 0;

        // Gracefully attempt to load the legal form family so a missing form becomes a business-rule error instead of a raw storage error.
        try { legalForm = await this.#storageEngine.getLegalForm(id); } catch (_error) { throw new RangeError('The requested legal form does not exist!', { 'cause': 'Input validation!' }); }

        // Reject deletion when any stored version has signatures because signed records must remain available for evidentiary retention.
        for (const versionId of legalForm.versionList) {
            /** Current legal form version loaded from persistent storage. */
            const legalFormVersion = await this.#storageEngine.getLegalFormVersion(versionId);

            // Block deletion once a signed version is found.
            if (legalFormVersion.signatureList.length !== 0) { throw new RangeError('The legal form cannot be removed because at least one version has signatures on file.', { 'cause': 'Input operation!' }); }
        }

        // Delete each immutable version record now that the form family has been verified to have no signatures.
        for (const versionId of legalForm.versionList) { await this.#storageEngine.removeLegalFormVersion(versionId); }

        // Delete the legal form family metadata after its version records have been removed.
        await this.#storageEngine.removeLegalForm(legalForm.id);
    }

    /**
     * Creates a legally evidentiary electronic signature for a specific legal form version.
     * @param signatureCapture Signature capture details and consent evidence submitted by the signer.
     * @returns The created legal form signature record.
     */
    public async newSignature(signatureCapture: LegalFormSignatureDraft): Promise<LegalFormSignature> {
        // #region Input Validation
        assertGuardEquals(signatureCapture);
        // #endregion Input Validation

        // Reject blank captured signature data so the stored evidentiary record always includes affirmative assent material.
        if (!signatureCapture.evidence.signature.trim()) { throw new RangeError('The captured signature cannot be empty.', { 'cause': 'Input validation!' }); }

        /** Registered member record loaded from persistent storage. */
        let member: Member | undefined = void 0;

        // Gracefully attempt to load the member so a missing member becomes a business-rule error instead of a raw storage error.
        try { member = await this.#storageEngine.getMember(signatureCapture.memberId); } catch (_error) { throw new RangeError('The requested member does not exist!', { 'cause': 'Input validation!' }); }

        /** Legal form family loaded from persistent storage. */
        let legalForm: LegalFormFamily | undefined = void 0;

        // Gracefully attempt to load the legal form family so a missing form becomes a business-rule error instead of a raw storage error.
        try { legalForm = await this.#storageEngine.getLegalForm(signatureCapture.formId); } catch (_error) { throw new RangeError('The requested legal form does not exist!', { 'cause': 'Input validation!' }); }

        /** Requested legal form version loaded from persistent storage. */
        let legalFormVersion: LegalFormVersion | undefined = void 0;

        // Gracefully attempt to load the requested legal form version so a missing version becomes a business-rule error instead of a raw storage error.
        try { legalFormVersion = await this.#storageEngine.getLegalFormVersion(signatureCapture.formVersionId); } catch (_error) { throw new RangeError('The requested legal form version does not exist!', { 'cause': 'Input validation!' }); }

        // Ensure that the provided form ID matches the version ID to prevent a confused messenger attack
        if (legalFormVersion.formId !== legalForm.id) { throw new RangeError('The requested legal form version does not belong to the requested legal form.', { 'cause': 'Input validation!' }); }

        // Ensure the version has not expired
        if (legalFormVersion.expiration && new Date(legalFormVersion.expiration) < new Date()) { throw new RangeError('The requested legal form version has expired and can no longer be signed.', { 'cause': 'Input validation!' }); }

        // Ensure that the version is active and not being signed before its effective date
        if (legalFormVersion.notBefore && new Date(legalFormVersion.notBefore) > new Date()) { throw new RangeError('The requested legal form version cannot be signed before the specified date.', { 'cause': 'Input validation!' }); }

        // Reject duplicate signatures against the same form version so a member has only one assent record per published version.
        for (const signatureId of member.signatureList) {
            /** Existing signature linked to the member. */
            const existingSignature = await this.#storageEngine.getSignature(signatureId);

            // Block duplicate signatures for the same legal form version.
            if (existingSignature.formVersionId === legalFormVersion.id) { throw new RangeError('The member has already signed the requested version of this legal form.', { 'cause': 'Input operation!' }); }
        }

        /** Created legal form signature persisted to storage. */
        const storedSignature = await this.#storageEngine.newSignature({
            'disclosureLanguage': signatureCapture.disclosureLanguage,
            'evidence': {
                ...signatureCapture.evidence,
                'signature': signatureCapture.evidence.signature.trim()
            },
            'formId': legalForm.id,
            'formVersionId': legalFormVersion.id,
            'memberId': member.id
        });

        // Add the created signature to the member so member-level compliance checks can locate it later.
        member.signatureList.push(storedSignature.id);

        // Add the created signature to the exact legal form version that was signed so version-specific assent is retained.
        legalFormVersion.signatureList.push(storedSignature.id);

        // Persist the updated member record with the new signature reference.
        await this.#storageEngine.newMember(member);

        // Persist the updated legal form version with the new signature reference.
        await this.#storageEngine.newLegalFormVersion(legalFormVersion);

        // Return the created legal form signature record to the caller.
        return storedSignature;
    }

    /**
     * Retrieves a specific legal form signature from persistent storage by its unique ID.
     * @param id Unique identifier of the legal form signature to retrieve.
     * @returns The requested legal form signature.
     */
    public async getSignature(id: LegalFormSignature['id']): Promise<LegalFormSignature>;

    /**
     * Retrieves all legal form signatures from persistent storage.
     * @returns List of all stored legal form signatures.
     */
    public async getSignature(): Promise<LegalFormSignature[]>;

    /**
     * Retrieves one legal form signature by ID or all legal form signatures when no ID is provided.
     * @param id Optional unique identifier of the legal form signature to retrieve.
     * @param _filter Filter used to select a subset of legal form signatures based on specific criteria. Not currently implemented and should be left undefined.
     * @returns The requested legal form signature or the full list of legal form signatures.
     */
    public async getSignature(id?: LegalFormSignature['id'], _filter?: never): Promise<LegalFormSignature | LegalFormSignature[]> {
        // #region Input Validation
        assertGuardEquals(id);

        assertGuardEquals(_filter);
        // #endregion Input Validation

        // Delegate signature retrieval to storage so the legal engine remains focused on legal business rules.
        if (typeof id === 'undefined') { return this.#storageEngine.getSignature(); }

        // Load and return the specific legal form signature when an ID is provided.
        return this.#storageEngine.getSignature(id);
    }

    // #endregion Business Logic
}
