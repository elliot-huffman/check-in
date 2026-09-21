/* eslint-disable react-hooks/refs */
import { AlertFilled, AlertRegular, NavigationRegular } from '@fluentui/react-icons';
import { Button, ToggleButton } from '@fluentui/react-components';
import { Layout, LayoutItem } from './LayoutSystem';
import { AccountManager } from './AccountManager';
import { Activity } from 'react';
import { useNavigate } from 'react-router';
import { useStyleList } from '@/styles/elements/TopBar';

/** Props for the TopBar component. */
interface TopBarProps {
    /** Object containing navigation menu toggle state and function. */
    'navMenuToggle'?: {
        /** Indicates whether the navigation menu is currently open. */
        'isMenuOpen': boolean;
        /** Function to set the navigation menu's open state. */
        'setMenuOpen': (isOpen: boolean) => void;
    };
    /** Object containing notification center toggle state and function. */
    'notificationCenterToggle'?: {
        /** Indicates whether the notification center is currently open. */
        'isOpen': boolean;
        /** Function to set the notification center's open state. */
        'setOpen': (isOpen: boolean) => void;
    };
    /** Reference object for the top bar's root element. */
    'ref'?: React.Ref<HTMLDivElement> | undefined;
}

/**
 * Renders the application's top bar with a navigation menu button and a home button.
 * @param props TopBarProps containing optional ref.
 * @returns Rendered top bar.
 */
export function TopBar(props: TopBarProps): React.ReactNode {
    /** Compiled CSS styles for the top bar. */
    const compiledStyles = useStyleList();

    /** Router used to navigate back to the main page. */
    const router = useNavigate();

    /** Changes the visibility of the notification center. Closes the nav menu if it is open to ensure that only one panel is visible at a time. */
    function toggleNotificationManager(): void {
        // Close the main navigation menu before opening the notification center.
        props.navMenuToggle?.setMenuOpen(false);

        // Toggle the notification center's open state.
        props.notificationCenterToggle?.setOpen(!props.notificationCenterToggle.isOpen);
    }

    // Render the top bar
    return (
        <Layout className={ compiledStyles.default } direction="column" justify="space-between" ref={ props.ref }>
            <LayoutItem invertParentDirection>
                <Activity mode={ props.navMenuToggle ? 'visible' : 'hidden' }>
                    <Button aria-label="Open navigation menu" appearance="subtle" size="large" icon={ <NavigationRegular /> } onClick={ (): void => { props.navMenuToggle?.setMenuOpen(!props.navMenuToggle.isMenuOpen); } } />
                </Activity>
                <Button appearance="transparent" size="large" onClick={ (): void => { void router('/'); } }>Check In Manager</Button>
            </LayoutItem>
            <LayoutItem invertParentDirection>
                <Activity mode={ props.notificationCenterToggle ? 'visible' : 'hidden' }>
                    <ToggleButton appearance="subtle" checked={ props.notificationCenterToggle?.isOpen ?? false } icon={ props.notificationCenterToggle?.isOpen ? <AlertFilled /> : <AlertRegular /> } onClick={ toggleNotificationManager } />
                </Activity>
                <AccountManager />
            </LayoutItem>
        </Layout >
    );
}
