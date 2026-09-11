/** Access control engine type imported from the runtime source declarations. */
type AccessControlEngine = import('../runtime/src/core/AccessControl.js').AccessControlEngine;
/** Member engine type imported from the runtime source declarations. */
type MemberEngine = import('../runtime/src/core/Member.js').MemberEngine;
/** Legal engine type imported from the runtime source declarations. */
type LegalEngine = import('../runtime/src/core/Legal.js').LegalEngine;

/** Global window contract for the Electron preload API. */
interface Window {
    /** IPC (Inter-Process Communication) API exposed by Electron. */
    'electronApi': {
        /** IPC facade for the access control engine. */
        'AccessControlEngine': {
            /** Checks a member into the facility. */
            'checkIn': AccessControlEngine['checkIn'];
            /** Checks a member out of the facility. */
            'checkOut': AccessControlEngine['checkOut'];
        };
        /** IPC facade for the member engine. */
        'MemberEngine': {
            /** Creates a new member record or updates (upsert) an existing member record. */
            'newMember': MemberEngine['newMember'];
            /** Retrieves one member record by ID or multiple member records by filter criteria. */
            'getMember': MemberEngine['getMember'];
            /** Deletes a member record by ID. */
            'removeMember': MemberEngine['removeMember'];
        };
        /** IPC facade for the legal engine. */
        'LegalEngine': {
            /** Creates or updates a legal form version. */
            'newForm': LegalEngine['newForm'];
            /** Publishes a new version for an existing legal form family. */
            'newFormVersion': LegalEngine['newFormVersion'];
            /** Appends new language variants to an unsigned legal form version. */
            'updateFormVersion': LegalEngine['updateFormVersion'];
            /** Retrieves one legal form family or all stored legal form families when no ID is supplied. */
            'getForm': LegalEngine['getForm'];
            /** Retrieves one legal form version or all stored legal form versions when no ID is supplied. */
            'getFormVersion': LegalEngine['getFormVersion'];
            /** Deletes an unsigned legal form version that no newer version depends on. */
            'removeFormVersion': LegalEngine['removeFormVersion'];
            /** Deletes a legal form family that has no signatures on file. */
            'removeForm': LegalEngine['removeForm'];
            /** Stores a new legal form signature. */
            'newSignature': LegalEngine['newSignature'];
            /** Retrieves one legal form signature or all stored signatures when no ID is supplied. */
            'getSignature': LegalEngine['getSignature'];
        };
    };
}
