import type { ToastIntent } from '@fluentui/react-components';
import type { tags } from 'typia';

/** Represents a notification managed by the NotificationManager. */
export interface ManagedNotification {
    /** Object ID of the notification. */
    'id': string & tags.Format<'uuid'>;
    /** Human friendly title for the notification. */
    'displayName': string;
    /** Content of the notification. */
    'content': React.ReactNode;
    /** Type of the notification, indicating its intent (e.g., success, error, warning, info). */
    'type': ToastIntent;
    /**
     * If a timeout is provided, the notification will disappear after that duration (in milliseconds).
     * If none is provided, the toast will not timeout.
     */
    'timeout'?: number;
}
