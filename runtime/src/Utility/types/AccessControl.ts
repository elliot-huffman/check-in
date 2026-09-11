import type { tags } from 'typia';

/** Represents common properties for check-in and check-out records. */
interface CommonCheckInOut {
    /** Unique identifier for the check-in/check-out record. */
    'id': string & tags.Format<'uuid'>;
    /** Object ID for the member associated with the check-in/check-out record. */
    'memberId': string & tags.Format<'uuid'>;
    /** Time at which the check-in/check-out occurred. */
    'timestamp': string & tags.Format<'date-time'>;
    /** Flag that indicates if the member is checking in or out. */
    'type': 'check-in' | 'check-out';
    /** Indicates which principal initiated the action. Null ID indicates the system initiated the action. */
    'initiatingActor': string & tags.Format<'uuid'>;
}

/** Represents a check-in audit log for a member. */
export interface CheckIn extends CommonCheckInOut {
    /** List of activities that the member is showing up for. */
    'activity': string[];
    /** Flag that indicates if the member is checking in. */
    'type': 'check-in';
}

/** Represents a check-out audit log for a member. */
export interface CheckOut extends CommonCheckInOut {
    /** Object ID of the corresponding check-in record that this record is checking out. */
    'checkInId': string & tags.Format<'uuid'>;
    /** Flag that indicates if the member is checking out. */
    'type': 'check-out';
}

/** Represents a check-in or check-out record for a member. */
export type CheckInOut = CheckIn | CheckOut;
