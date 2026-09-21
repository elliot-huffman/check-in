import { DrawerBody, DrawerHeader, DrawerHeaderTitle, InlineDrawer, Toast, ToastBody, ToastTitle, Toaster, useToastController } from '@fluentui/react-components';
import { Fragment, useCallback, useId, useRef, useState } from 'react';
import type { ManagedNotification } from '@/utility/types/components/NotificationManager';
import { NotificationManagerContext } from './NotificationManagerContext';
import type { ToastUpdateOptions } from '@fluentui/react-toast';
import { assertGuardEquals } from 'typia';
import { useStyleList } from '@/styles/components/NotificationCenter';

/** Represents the state of a managed notification center, including its visibility and the list of notifications. */
interface ManagedNotificationProps {
    /** Flag that controls the visibility state of the notification center. */
    'open': boolean;
    /** Child components to be rendered within the notification manager. */
    'children': React.ReactNode;
}

/**
 * Renders the NotificationManager component, which manages and displays notifications within the application via a toaster and an inline drawer for past notifications.
 * @param props ManagedNotificationProps containing the properties passed from the parent component.
 * @returns The rendered NotificationManager component as a React node.
 */
export function NotificationManager(props: ManagedNotificationProps): React.ReactNode {
    /** Compiled list of CSS styles for the notification center. */
    const compiledStyleList = useStyleList();

    /** Unique ID for the toaster component. */
    const toasterId = useId();

    /** Toast controller that fluent UI uses to manage toast notifications in the toaster component. */
    const toastController = useToastController(toasterId);

    /**
     * Synchronous source of truth for managed notifications.
     *
     * React state does not update immediately, so imperative notification manager operations must read from this ref rather than from the render snapshot.
     */
    const notificationListRef = useRef<ManagedNotification[]>([]);

    // List of notifications currently managed by the NotificationManager.
    const [notificationList, setNotificationList] = useState<ManagedNotification[]>([]);

    /**
     * Commits the updated notification list to both the ref and the React state.
     * @param updatedList The new list of managed notifications.
     */
    const commitNotificationList = useCallback((updatedList: ManagedNotification[]): void => {
        // Synchronously update the ref with the new list.
        notificationListRef.current = updatedList;

        // Schedule the React state update with the new list.
        setNotificationList(updatedList);
    }, []);

    /**
     * Creates a new notification and adds it to the managed notification list.
     * @param config Configuration object for the new notification, excluding the ID.
     * @returns The ID of the newly created notification.
     */
    function newNotification(config: Omit<ManagedNotification, 'id'>): ManagedNotification['id'] {
        /** Newly constructed notification object based on the provided configuration. */
        const computedNotification: ManagedNotification = {
            ...config,
            'id': crypto.randomUUID()
        };

        /** Set of options to update the toast notification in the toast controller. */
        const toasterOptionsPayload: ToastUpdateOptions = {
            'intent': config.type,
            'timeout': config.timeout ?? -1,
            'toastId': computedNotification.id
        };

        // Render the toast notification using the toast controller.
        toastController.dispatchToast(<Toast key={ computedNotification.id }>
            <ToastTitle>{ config.displayName }</ToastTitle>
            <ToastBody>{ config.content }</ToastBody>
        </Toast>, toasterOptionsPayload);

        // Add the newly created notification to the list of managed notifications.
        commitNotificationList(notificationList.concat(computedNotification));

        // Return the ID of the newly created notification.
        return computedNotification.id;
    }

    /**
     * Updates an existing notification in the managed notification list.
     * @param id ID of the notification to be updated.
     * @param updatedConfig Partial configuration object containing the properties to be updated.
     * @returns The ID of the updated notification object.
     */
    function setNotification(id: ManagedNotification['id'], updatedConfig: Partial<ManagedNotification>): ManagedNotification['id'] {
        // #region Input Validation
        assertGuardEquals(id);
        // #endregion Input Validation

        /** Index of the notification to be updated in the managed notification list. */
        const notificationIndex = notificationListRef.current.findIndex((notification) => notification.id === id);

        // Indicate that the notification with the specified ID was not found.
        if (notificationIndex === -1) { throw new RangeError(`Notification with ID ${ id } not found!`, { 'cause': 'Object not found!' }); }

        /** Notification object representing the updated state of the notification. */
        const newItem: ManagedNotification = {
            ...notificationListRef.current[notificationIndex],
            ...(updatedConfig as Required<ManagedNotification>),
            id
        };

        // Update the notification list with the newly updated item
        commitNotificationList(notificationListRef.current.with(notificationIndex, newItem));

        /** Set of options to update the toast notification in the toast controller. */
        const toasterUpdatePayload: ToastUpdateOptions = {
            'content':
                <Toast key={ id }>
                    <ToastTitle>{ newItem.displayName }</ToastTitle>
                    <ToastBody>{ newItem.content }</ToastBody>
                </Toast>,
            'toastId': id
        };

        // Update the intent of the toast notification if a new type is provided.
        if (updatedConfig.type) { toasterUpdatePayload.intent = updatedConfig.type; }

        // Update the timeout of the toast notification if a new timeout is provided.
        if ('timeout' in updatedConfig) { toasterUpdatePayload.timeout = updatedConfig.timeout; }

        // Update the toasted notification in the toast controller with the modification(s).
        toastController.updateToast(toasterUpdatePayload);

        // Return the updated notification object to the caller.
        return id;
    }

    /**
     * Removes a notification from the managed notification list based on its ID.
     * @param id ID of the notification to be removed.
     */
    function removeNotification(id: ManagedNotification['id']): void {
        // #region Input Validation
        assertGuardEquals(id);
        // #endregion Input Validation

        // Remove the notification from the notification list
        commitNotificationList(notificationListRef.current.filter((notification) => notification.id !== id));

        // Remove the toast notification from the toast controller.
        toastController.dismissToast(id);
    }

    /** Context value object containing notification management functions and toaster ID. */
    const contextValue = {
        newNotification,
        removeNotification,
        setNotification,
        toasterId
    };

    // Render the notification area
    return (
        <NotificationManagerContext value={ contextValue }>
            <Toaster toasterId={ toasterId } position="top-end" pauseOnHover offset={ { 'vertical': 50 } } />
            { props.children }
            <InlineDrawer open={ props.open } position="end" className={ compiledStyleList.notificationContainer }>
                <DrawerHeader>
                    <DrawerHeaderTitle>Notifications</DrawerHeaderTitle>
                </DrawerHeader>
                <DrawerBody>
                    { notificationList.map((notification) => <Fragment key={ notification.id }>
                        <Toast>
                            <ToastTitle>{ notification.displayName }</ToastTitle>
                            <ToastBody>{ notification.content }</ToastBody>
                        </Toast>
                        <br />
                    </Fragment>) }
                </DrawerBody>
            </InlineDrawer>
        </NotificationManagerContext>
    );
}
