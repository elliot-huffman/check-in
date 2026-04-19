import type { tags } from 'typia';

/** Represents an emergency contact for a member. */
interface EmergencyContact {
    /** Name of the emergency contact. */
    'name': string;
    /** Relationship of the emergency contact to the member. */
    'relationship': string;
    /** Phone number of the emergency contact. */
    'phoneNumber': number | null;
    /** Email address of the emergency contact. */
    'email': string & tags.Format<'email'> | null;
}

/** Represents a member in the access control system. */
export interface Member {
    /** Object ID for the member. */
    'id': string & tags.Format<'uuid'>;
    /** First name of the member. */
    'firstName': string;
    /** Last name of the member. */
    'lastName': string;
    /** Phone number of the member. */
    'phoneNumber': number | null;
    /** Email address of the member. */
    'email': string & tags.Format<'email'> | null;
    /** Home address of the member. */
    'homeAddress': {
        /** Street address of the member. */
        'streetAddress': string;
        /** Postal code of the member's address. */
        'postalCode': string;
        /** City of the member's address. */
        'city': string;
        /** State of the member's address. */
        'state': string;
        /** ZIP code of the member's address. */
        'zipCode': string;
    } | null;
    /** Accessibility needs of the member. */
    'accessibilityNeeds': {
        /** Flag that indicates if the member requires a wheelchair. */
        'wheelchair': boolean;
        /** Flag that indicates if the member has a hearing impairment. */
        'hearingImpairment': boolean;
        /** Flag that indicates if the member has a visual impairment. */
        'visualImpairment': boolean;
        /** Flag that indicates if the member has a mobility impairment. */
        'mobilityImpairment': boolean;
        /** Other accessibility needs of the member. */
        'other': string | null;
    };
    /** List of emergency contacts for the member. Could include doctor contact details. */
    'emergencyContactList': EmergencyContact[];
}

/** Represents a check-in or check-out record for a member. */
export interface CheckInOut {
    /** Unique identifier for the check-in/check-out record. */
    'id': string & tags.Format<'uuid'>;
    /** Object ID for the member associated with the check-in/check-out record. */
    'memberId': string & tags.Format<'uuid'>;
    /** Time at which the check-in/check-out occurred. */
    'timestamp': InstanceType<typeof Date>;
    /** Flag that indicates if the member is checking in or out. */
    'type': 'check-in' | 'check-out';
    /** Indicates which principal initiated the action. Null ID indicates the system initiated the action. */
    'initiatingActor': string & tags.Format<'uuid'>;
    /** List of activities that the member is showing up for. */
    'activity': string[];
}
