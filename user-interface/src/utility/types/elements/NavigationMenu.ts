/** Base interface for all menu entities. */
interface MenuEntity {
    /** Object ID of the menu entity. */
    'id': string;
    /** Flag that describes the type of the menu entity. */
    'type': string;
}

/** Describes a leaf menu item. */
export interface MenuItem extends MenuEntity {
    /** Flag that describes the type of the menu entity as a leaf item. */
    'type': 'item';
    /** URL Path to route to when the menu item is selected. */
    'destination': string;
    /** Human friendly display label for the menu item. */
    'label': string;
    /** Optional icon for the menu item to render. Please use Fluent UI icons where possible. */
    'icon'?: React.ReactElement | undefined;
}

/** Describes a container menu item that can hold other menu items. */
export interface MenuItemContainer extends MenuEntity {
    /** Flag that describes the type of the menu entity as a container. */
    'type': 'container';
    /** Human friendly display label for the menu entity. */
    'label': string;
    /** Optional icon for the menu entity to render. Please use Fluent UI icons where possible. */
    'icon'?: React.ReactElement | undefined;
    /** Menu items to be rendered within this container. */
    'children': MenuItem[];
}

/** Named divider for the menu. */
export interface MenuDivider extends MenuEntity {
    /** Flag that describes the type of the menu entity as a divider. */
    'type': 'divider';
    /** Optional label for the divider. */
    'label'?: string | undefined;
}

/** Union type for all possible menu entries. */
export type MenuEntry = MenuItem | MenuItemContainer | MenuDivider;

/** Configuration for the navigation menu header. */
export interface NavigationMenuHeaderConfiguration {
    /** Title of the navigation menu to render. */
    'title': string;
    /** Icon to be displayed alongside the title in the navigation menu. Please use fluent icons where possible. */
    'icon'?: React.ReactElement | undefined;
}

/** Configuration for the navigation menu. */
export interface NavigationMenuUnifiedConfiguration {
    /** Header configuration for the navigation menu. */
    'header'?: NavigationMenuHeaderConfiguration;
    /** List of items to be rendered in the navigation menu. */
    'items': Omit<MenuEntry, 'id'>[];
}
