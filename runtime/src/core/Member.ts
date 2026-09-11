import type { Member } from '../Utility/types/Member.js';
import { StorageEngine } from './Storage.js';
import { assertGuardEquals } from 'typia';

/** Engine responsible for managing members. */
export class MemberEngine {
    /** Instance of the MemberEngine singleton. */
    static #instance: MemberEngine | undefined = void 0;
    /** Instance of the StorageEngine used by the MemberEngine. */
    #storageEngine: StorageEngine;

    // #region Initialization

    /**
     * Initializes the properties and state of the StorageEngine.
     * @param storageEngine Instance of the StorageEngine to use for the MemberEngine's operations, required for dependency injection.
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
    public static async getInstance(): Promise<MemberEngine> {
        /** Check if the singleton instance is initialized, and initialize it if it isn't. */
        if (typeof this.#instance === 'undefined') {
            /** Instance of the StorageEngine used by the MemberEngine. */
            const storageEngine = await StorageEngine.getInstance();

            // Finish loading the member engine's properties and state after the storage engine is loaded, as it is a dependency for the member engine.
            this.#instance = new MemberEngine(storageEngine);
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
     * Creates a new member record or updates (upsert) an existing member record.
     * @param memberDraft Member data to persist.
     * @returns The stored member record.
     */
    public async newMember(memberDraft: Member | Omit<Member, 'id'>): Promise<Member> {
        // #region Input Validation
        assertGuardEquals(memberDraft);
        // #endregion Input Validation

        // Reject blank first names so stored member records remain identifiable.
        if (!memberDraft.firstName.trim()) { throw new RangeError('The member first name cannot be empty.', { 'cause': 'Input validation!' }); }

        // Reject blank last names so stored member records remain identifiable.
        if (!memberDraft.lastName.trim()) { throw new RangeError('The member last name cannot be empty.', { 'cause': 'Input validation!' }); }

        /** Member record normalized before being persisted to storage. */
        const computedMember: Member | Omit<Member, 'id'> = {
            ...memberDraft,
            'accessibilityNeeds': {
                ...memberDraft.accessibilityNeeds,
                'other': memberDraft.accessibilityNeeds.other?.trim() ?? null
            },
            'email': memberDraft.email?.trim() ?? null,
            'emergencyContactList': memberDraft.emergencyContactList.map((emergencyContact) => ({
                ...emergencyContact,
                'email': emergencyContact.email?.trim() ?? null,
                'name': emergencyContact.name.trim(),
                'relationship': emergencyContact.relationship.trim()
            })),
            'firstName': memberDraft.firstName.trim(),
            'homeAddress': memberDraft.homeAddress
                ? {
                    ...memberDraft.homeAddress,
                    'city': memberDraft.homeAddress.city.trim(),
                    'postalCode': memberDraft.homeAddress.postalCode.trim(),
                    'state': memberDraft.homeAddress.state.trim(),
                    'streetAddress': memberDraft.homeAddress.streetAddress.trim(),
                    'zipCode': memberDraft.homeAddress.zipCode.trim()
                }
                : null,
            'lastName': memberDraft.lastName.trim()
        };

        // Persist the normalized member record and return the stored representation to the caller.
        return await this.#storageEngine.newMember(computedMember);
    }

    /**
     * Retrieves a specific member.
     * @param id Unique identifier of the member to retrieve.
     * @returns The requested member.
     */
    public async getMember(id: Member['id']): Promise<Member>;

    /**
     * Retrieves every stored member.
     * @param filter Optional filter used to select a subset of members.
     * @returns List of stored members.
     */
    public async getMember(id: never, filter?: Partial<Member>): Promise<Member[]>;

    /**
     * Retrieves one member by ID or all members when no ID is provided.
     * @param id Optional unique identifier of the member to retrieve.
     * @param filter Optional filter used to select a subset of members.
     * @returns The requested member or the full member list.
     */
    public async getMember(id?: Member['id'], filter?: Partial<Member>): Promise<Member | Member[]> {
        // #region Input Validation
        assertGuardEquals(id);

        assertGuardEquals(filter);
        // #endregion Input Validation

        // Return all members when no specific member is requested.
        if (!id) { return await this.#storageEngine.getMember(void 0 as never, filter); }

        // Gracefully attempt to load the member so a missing member becomes a business-rule error instead of a raw storage error.
        try { return await this.#storageEngine.getMember(id); } catch (_error) { throw new RangeError('The requested member does not exist!', { 'cause': 'Input validation!' }); }
    }

    /**
     * Removes a member from the system, only if they don't have any signatures.
     * @param id Unique identifier of the member to remove.
     */
    public async removeMember(id: Member['id']): Promise<void> {
        // #region Input Validation
        assertGuardEquals(id);
        // #endregion Input Validation

        /** Requested member record loaded from persistent storage. */
        let member: Member | undefined = void 0;

        // Gracefully attempt to load the member so a missing member becomes a business-rule error instead of a raw storage error.
        try { member = await this.getMember(id); } catch (_error) { throw new RangeError('The requested member does not exist!', { 'cause': 'Input validation!' }); }

        // Signed member records must remain retained because the signatures reference the member record.
        if (member.signatureList.length !== 0) { throw new RangeError('The member cannot be removed because signatures are on file.', { 'cause': 'Input operation!' }); }

        // Delete the member record now that it has been verified to have no signatures on file.
        await this.#storageEngine.removeMember(member.id);
    }

    // #endregion Business Logic
}
