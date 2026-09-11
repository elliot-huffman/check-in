import type { LanguageCodes } from './i18n.js';
import type { tags } from 'typia';

/** Represents a legal form family, that can have multiple versions. */
export interface LegalForm {
    /** Object ID for the legal form family. */
    'id': string & tags.Format<'uuid'>;
    /** Object ID for the current version of the legal form to allows for quick retrieval. */
    'currentVersionId': LegalFormVersion['id'] | null;
    /** Human friendly display name for the legal form family. */
    'displayName': string & tags.MinLength<1>;
    /** Long form description of the legal form family. */
    'description': string;
    /**
     * Ordered list of all version record IDs associated with this legal form.
     * They index is the version number of the form minus one.
     *
     * To get the latest version of a legal form, access the last element in this array (`versionList[versionList.length - 1]`).
     */
    'versionList': LegalFormVersion['id'][];
}

/** Represents content used to create a new legal form or publish a new version. */
export type LegalFormDraft = Omit<LegalForm, 'id'>;

/** Represents one immutable, signable version of a legal form. */
export interface LegalFormVersion {
    /**
     * Content of the legal form that is to be signed.
     *
     * Where the key is the language code.
     * Where the value is the content of the legal form in that language.
     */
    'content': Record<LanguageCodes, string & tags.MinLength<3>>;
    /** Date and time the version was published for signing. */
    'createdAt': string & tags.Format<'date-time'>;
    /** Description of the legal form. */
    'description': string;
    /** Display name of the legal form. */
    'displayName': string & tags.MinLength<1>;
    /** Time at which new signatures can no longer be accepted. `null` means no expiration. */
    'expiration': string & tags.Format<'date-time'> | null;
    /** Time before which signatures cannot be accepted. `null` means no restriction. */
    'notBefore': string & tags.Format<'date-time'> | null;
    /** Object ID for the legal form family this version belongs to. */
    'formId': LegalForm['id'];
    /** Object ID for the legal form version. */
    'id': string & tags.Format<'uuid'>;
    /** Object ID for the prior version, if any. */
    'previousVersionId': LegalFormVersion['id'] | null;
    /** List of signatures associated only with this exact form version. */
    'signatureList': LegalFormSignature['id'][];
    /** Content version of the legal form. */
    'version': number;
}

/** Represents additional translated content that may be appended to an existing form version. */
export type LegalFormVersionDraft = Pick<LegalFormVersion, 'content' | 'expiration' | 'notBefore'>;

/** Represents a legal form signature for a member. */
export interface LegalFormSignature {
    /** Object ID for the legal form signature. */
    'id': string & tags.Format<'uuid'>;
    /** Object ID for the member that signed the legal form. */
    'memberId': string & tags.Format<'uuid'>;
    /** Object ID for the legal form family that was signed. */
    'formId': string & tags.Format<'uuid'>;
    /** Object ID for the specific legal form version that was signed. */
    'formVersionId': LegalFormVersion['id'];
    /** Language used when presenting the legal form to the signer. */
    'disclosureLanguage': LanguageCodes;
    /** Evidentiary metadata captured at signing time. */
    'evidence': {
        /** Flag confirming that the signer consented to receiving and retaining the record electronically. */
        'consentToElectronicRecords': true;
        /** Flag confirming that the signer consented to using an electronic signature. */
        'consentToElectronicSignature': true;
        /** Flag confirming that the signer affirmatively manifested intent to sign. */
        'intentConfirmed': true;
        /** Flag confirming that the signer acknowledged they can retain a copy of the record. */
        'retentionConfirmed': true;
        /** Typed name or base64 encoded signature image. */
        'signature': string & tags.MinLength<1>;
        /** Method used to capture the signature. */
        'signatureMethod': 'typed-name-attestation' | 'signed-signature-capture';
    };
    /** Timestamp indicating when the legal form was signed. */
    'timestamp': string & tags.Format<'date-time'>;
}

/** Represents the data collected at the time a legal form signature is captured. */
export type LegalFormSignatureDraft = Omit<LegalFormSignature, 'id' | 'timestamp'>;
