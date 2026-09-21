import { BarcodeScanner20Regular, Home20Regular, Info20Regular, PeopleSettings20Regular, PeopleSync20Regular, PersonAdd20Regular, Settings20Regular } from '@fluentui/react-icons';
import { Layout, LayoutItem } from './LayoutSystem';
import type { MenuItem, NavigationMenuUnifiedConfiguration } from '@/utility/types/components/NavigationMenu';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NavigationMenu } from './NavigationMenu';
import { NotificationManager } from './NotificationManager';
import { TopBar } from './TopBar';
import { useStyleList } from '@/styles/globalTemplate';

/** Structure of the template component's props. */
interface TemplateProps {
    /** Page content to be rendered within the template. */
    'children'?: React.ReactNode;
}

/**
 * Container for components that should be available on all pages.
 * @param props TemplateProps containing optional children.
 * @returns A React node representing the template layout.
 */
export default function Template(props: TemplateProps): React.ReactNode {
    /** CSS Styles compiled for the root template in Next.js. */
    const compiledStyles = useStyleList();

    // Local state that controls the state of the navigation menu's visibility
    const [isMenuOpen, setMenuOpen] = useState(true);

    // Local state that controls the state of the notification center's visibility
    const [isNotificationCenterOpen, setNotificationCenterOpen] = useState(false);

    /** Instance of the Top Bar's HTML element, used for calculating the content container's height. */
    const topBarRef = useRef<HTMLDivElement>(null);

    /** Instance of the content container's HTML element, to inject manual styling into. */
    const contentContainerRef = useRef<HTMLDivElement>(null);

    /** Function that calculates the max height of the content container based on the Top Bar's height. */
    const calculateContentMaxHeight = useCallback(() => {
        /** Max height to set the content container to. Defaults to 100vh as a fallback. */
        let calculatedMaxHeight = '100vh';

        // Check if the ref is initialized before trying to access the element's dimensions.
        if (topBarRef.current) { calculatedMaxHeight = `calc(100vh - ${ topBarRef.current.getBoundingClientRect().bottom }px)`; }

        // Set the max height of the content container to ensure it doesn't overflow the viewport, accounting for the Top Bar's height.
        if (contentContainerRef.current) { contentContainerRef.current.style.maxHeight = calculatedMaxHeight; }
    }, []);

    // Manually inject the max height of the content container to ensure perfect scrolling behavior
    useLayoutEffect(() => { calculateContentMaxHeight(); }, [calculateContentMaxHeight]);

    // Automatically recalculate the content container's max height whenever the window is resized to maintain proper layout and scrolling behavior.
    useEffect(() => {
        // Recalculate the content container's max height whenever the window is resized.
        window.addEventListener('resize', calculateContentMaxHeight);

        // Cleanup function to remove the event listener when the component unmounts.
        return (): void => { window.removeEventListener('resize', calculateContentMaxHeight); };
    }, [calculateContentMaxHeight]);

    /** Configuration for the navigation menu. */
    const navigationMenuConfig: NavigationMenuUnifiedConfiguration = {
        'header': { 'title': 'Navigation Menu' },
        'items': [
            {
                'label': 'General',
                'type': 'divider'
            },
            {
                'destination': '/',
                'icon': <Home20Regular />,
                'label': 'Home',
                'type': 'item'
            } as MenuItem,
            {
                'destination': '/Check-In',
                'icon': <BarcodeScanner20Regular />,
                'label': 'Check-In',
                'type': 'item'
            } as MenuItem,
            {
                'label': 'Member Management',
                'type': 'divider'
            },
            {
                'destination': '/Member/Manage',
                'icon': <PeopleSettings20Regular />,
                'label': 'Manage',
                'type': 'item'
            } as MenuItem,
            {
                'destination': '/Member/Create',
                'icon': <PersonAdd20Regular />,
                'label': 'Create',
                'type': 'item'
            } as MenuItem,
            {
                'destination': '/Member/Import',
                'icon': <PeopleSync20Regular />,
                'label': 'Import',
                'type': 'item'
            } as MenuItem,
            {
                'label': 'System',
                'type': 'divider'
            },
            {
                'destination': '/Settings',
                'icon': <Settings20Regular />,
                'label': 'Settings',
                'type': 'item'
            } as MenuItem,
            {
                'destination': '/About',
                'icon': <Info20Regular />,
                'label': 'About',
                'type': 'item'
            } as MenuItem
        ]
    };

    // Rendered page wrapper
    return (
        <Layout>
            <TopBar
                ref={ topBarRef }
                navMenuToggle={ {
                    isMenuOpen,
                    setMenuOpen
                } }
                notificationCenterToggle={ {
                    'isOpen': isNotificationCenterOpen,
                    'setOpen': setNotificationCenterOpen
                } } />
            <Layout direction="column" noWrap ref={ contentContainerRef }>
                <NavigationMenu open={ isMenuOpen } setMenuOpenState={ setMenuOpen } menuLayout={ navigationMenuConfig } />
                <NotificationManager open={ isNotificationCenterOpen }>
                    <LayoutItem className={ compiledStyles.pageContent } >
                        { props.children }
                    </LayoutItem>
                </NotificationManager>
            </Layout>
        </Layout>
    );
}
