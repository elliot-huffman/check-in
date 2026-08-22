import { Activity, useMemo } from 'react';
import { DrawerHeaderTitle, NavCategory, NavCategoryItem, NavDrawer, NavDrawerBody, NavDrawerHeader, NavItem, NavSectionHeader, NavSubItem, NavSubItemGroup, type OnNavItemSelectData } from '@fluentui/react-components';
import { Layout, LayoutItem } from './LayoutSystem';
import type { MenuEntry, MenuItem, MenuItemContainer, NavigationMenuUnifiedConfiguration } from '@/utility/types/elements/NavigationMenu';
import { useNavigate, useLocation } from 'react-router';
import { useStyleList } from '@/styles/elements/NavigationMenu';

/** Props for the NavigationMenu component. */
interface NavigationMenuProps {
    /** Configuration for the navigation menu, including the list of items to be rendered. */
    'menuLayout': NavigationMenuUnifiedConfiguration;
    /** Flag that controls the visibility of the navigation menu. */
    'open': boolean;
    /**
     * Executed when the navigation menu's open state changes from within the menu itself, such as when the user opens or closes the menu. This function should update the state that controls the 'open' prop to ensure the menu's visibility is in sync with user interactions.
     * @param newState Updated isOpen flag state that indicates whether the navigation menu should be open or closed after the change.
     */
    'setMenuOpenState': (newState: boolean) => void;
    /** Optional React ref attached to the rendered parent div element. */
    'ref'?: React.Ref<HTMLDivElement>;
}

/**
 * Renders the application's navigation drawer with links to shared pages.
 * @param props Configuration of the navigation menu, including the list of items to be rendered and an optional React ref.
 * @returns Rendered navigation drawer.
 */
export function NavigationMenu(props: NavigationMenuProps): React.ReactNode {
    /** Router used to navigate to the selected page. */
    const router = useNavigate();

    /** Current page path used to determine the selected navigation item. */
    const currentPage = useLocation();

    /** Compiled CSS styles for the navigation menu. */
    const compiledStyles = useStyleList();

    /**
     * Removes a trailing slash so routes compare and route consistently.
     * @param path The path to normalize.
     * @returns The normalized path without a trailing slash.
     */
    function normalizePath(path: string): string { return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path; }

    /** Menu entries normalized into renderable items with generated IDs for selection and keys. */
    const computedMenu = useMemo(() => {
        /** Route lookup keyed by the generated value assigned to each rendered nav item. */
        const destinationById = new Map<string, string>();

        /** Selection lookup keyed by the destination path for each rendered nav item. */
        const selectedValueByPath = new Map<string, string>();

        /**
         * Converts menu link data into a normalized leaf entry.
         * @param item The menu item to normalize.
         * @returns The normalized menu item.
         */
        function normalizeMenuLink(item: Omit<MenuItem, 'id'>): MenuItem {
            /** Randomly generated UUIDv4 string to use as the unique identifier for the menu item. */
            const id = crypto.randomUUID();

            /** Normalized destination path for consistent routing. */
            const destination = normalizePath(item.destination);

            // Populate lookups for routing and selected item determination based on the generated ID and normalized destination path
            destinationById.set(id, destination);

            // If multiple items share the same destination, the last one in the list will be the one that is selected when on that page, which is an acceptable outcome since they all route to the same place anyway.
            selectedValueByPath.set(destination, id);

            // Return the normalized menu item with the generated ID and normalized destination, along with the original label and optional icon
            return {
                ...typeof item.icon === 'undefined' ? {} : { 'icon': item.icon },
                destination,
                id,
                'label': item.label,
                'type': item.type
            };
        }

        /** List of menu items that have been put into the proper format for rendering and navigation. */
        const computedMenuList: MenuEntry[] = [];

        // Iterate through each item and ensure they are ready for rendering and integration with and consumption by the navigation system.
        for (const menuItem of props.menuLayout.items) {
            // Process each menu item based on its type to ensure it is properly prepared for rendering and interaction with the navigation system.
            switch (menuItem.type) {
                case 'container': {
                    // Normalize the container item and all of its children, then add them to the menu item list for rendering. The container itself is not selectable and does not have a destination, but its children are rendered as selectable items that route to their respective destinations.
                    computedMenuList.push({
                        'id': crypto.randomUUID(),
                        'label': menuItem.label,
                        ...typeof (menuItem as MenuItemContainer).icon === 'undefined' ? {} : { 'icon': (menuItem as MenuItemContainer).icon },
                        'children': (menuItem as MenuItemContainer).children.map((child) => normalizeMenuLink(child)),
                        'type': 'container'
                    } as MenuItemContainer);

                    // Stop execution to prevent fall through
                    break;
                }
                case 'divider': {
                    // Add the divider to the menu item list for rendering
                    computedMenuList.push({
                        'id': crypto.randomUUID(),
                        'label': menuItem.label,
                        'type': 'divider'
                    });

                    // Stop execution to prevent fall through
                    break;
                }
                case 'item': {
                    // Normalize the menu item and add it to the menu item list for rendering
                    computedMenuList.push(normalizeMenuLink(menuItem as Omit<MenuItem, 'id'>));

                    // Stop execution to prevent fall through
                    break;
                }
                default: // Skip the current item as it is unknown to the system and can't be safely processed
            }
        }

        // Memoize the resulting menu items and metadata
        return {
            computedMenuList,
            destinationById,
            'firstItemId': computedMenuList[0]?.id,
            'selectedValue': selectedValueByPath.get(normalizePath(currentPage.pathname)) ?? ''
        };
    }, [currentPage.pathname, props.menuLayout.items]);

    /**
     * Navigates to the selected page when a mapped nav item is clicked.
     * @param _event Event object for the navigation item selection, not used in the function.
     * @param data Data object containing the value of the selected navigation item, used to look up the corresponding destination path and navigate to it.
     */
    function navigationManager(_event: unknown, data: OnNavItemSelectData): void {
        /** Path to navigate to for the selected navigation item. */
        const destination = computedMenu.destinationById.get(data.value);

        // If a destination path exists for the selected navigation item, navigate to that path using the router. If no destination is found, do nothing.
        if (typeof destination === 'string') { void router(destination); }
    }

    /**
     * Renders a normalized menu entry into the Fluent drawer structure.
     * @param item The menu entry to render, which can be a divider, a container with child items, or a leaf item with a destination.
     * @returns React node representing the rendered menu entry.
     */
    function renderNavEntry(item: MenuEntry): React.ReactNode {
        // Render the correct fluent UI component based on the type of the menu entry
        switch (item.type) {
            case 'divider':
                // Render a section header for dividers, using the label as the header text if it exists
                return <NavSectionHeader>{ item.label }</NavSectionHeader>;
            case 'container':
                return (
                    <NavCategory value={ item.id } key={ item.id }>
                        <NavCategoryItem { ...(typeof item.icon === 'undefined' ? {} : { 'icon': item.icon }) }>{ item.label }</NavCategoryItem>
                        <NavSubItemGroup>
                            { item.children.map((menuItem) => <NavSubItem key={ menuItem.id } value={ menuItem.id } { ...(typeof menuItem.icon === 'undefined' ? {} : { 'icon': menuItem.icon }) }>{ menuItem.label }</NavSubItem>) }
                        </NavSubItemGroup>
                    </NavCategory>
                );
            case 'item':
                return <NavItem key={ item.id } { ...(typeof item.icon === 'undefined' ? {} : { 'icon': item.icon }) } value={ item.id } className={ compiledStyles.colorFix } >{ item.label }</NavItem>;
            default:
                // Render nothing on an unknown menu item type
                return <></>;
        }
    }

    // Render the navigation drawer with the appropriate visibility and event handlers
    return (
        <NavDrawer
            open={ props.open }
            type="inline"
            className={ compiledStyles.navContainer }
            onNavItemSelect={ navigationManager }
            selectedValue={ computedMenu.selectedValue }
            onOpenChange={ (_event, data): void => { props.setMenuOpenState(data.open); } }
            // @ts-expect-error - The NavDrawer component's type definitions are currently inaccurate and do not recognize the ref prop, but it is supported in practice and necessary for proper functionality, so we will ignore the type error for now until the library is updated with correct types.
            ref={ props.ref }
        >
            <NavDrawerBody className={ compiledStyles.headerPaddingFix }>
                <Activity mode={ props.menuLayout.header ? 'visible' : 'hidden' }>
                    <NavDrawerHeader>
                        <Layout>
                            <LayoutItem align="center">
                                { props.menuLayout.header?.icon }
                                <DrawerHeaderTitle className={ props.menuLayout.header?.icon && compiledStyles.headerIconPadding }>{ props.menuLayout.header?.title }</DrawerHeaderTitle>
                            </LayoutItem>
                        </Layout>
                    </NavDrawerHeader>
                </Activity>
                { computedMenu.computedMenuList.map((item) => renderNavEntry(item)) }
            </NavDrawerBody>
        </NavDrawer>
    );
}
