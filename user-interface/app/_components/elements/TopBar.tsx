/* eslint-disable react-hooks/refs */
'use client';

import { Layout, LayoutItem } from './LayoutSystem';
import { AccountManager } from './AccountManager';
import { Activity } from 'react';
import { Button } from '@fluentui/react-components';
import { NavigationRegular } from '@fluentui/react-icons';
import { useRouter } from 'next/navigation';
import { useStyleList } from '../styles/elements/TopBar';

/** Props for the TopBar component. */
interface TopBarProps {
    /** Object containing navigation menu toggle state and function. */
    'navMenuToggle'?: {
        /** Indicates whether the navigation menu is currently open. */
        'isMenuOpen': boolean;
        /** Function to set the navigation menu's open state. */
        'setMenuOpen': (isOpen: boolean) => void;
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
    const router = useRouter();

    // Render the top bar
    return (
        <Layout className={ compiledStyles.default } direction="column" justify="space-between" ref={ props.ref }>
            <LayoutItem invertParentDirection>
                <Activity mode={ props.navMenuToggle ? 'visible' : 'hidden' }>
                    <Button aria-label="Open navigation menu" appearance="subtle" size="large" icon={ <NavigationRegular /> } onClick={ (): void => { props.navMenuToggle?.setMenuOpen(!props.navMenuToggle.isMenuOpen); } } />
                </Activity>
                <Button appearance="transparent" size="large" onClick={ (): void => { router.push('/'); } }>Check In Manager</Button>
            </LayoutItem>
            <AccountManager />
        </Layout>
    );
}
