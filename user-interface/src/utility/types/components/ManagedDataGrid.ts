/** Configuration used to get custom functionality out of the managed data grid. */
export interface ManagedDataGridConfiguration<T> {
    /**
     * Overrides the display name for the columns in the managed data grid.
     * Does not update the property names of the items passed into the data grid to be rendered.
     *
     * Where the key is the name of the column/property to override.
     * Where the Value is the display name for the column to render.
     */
    'columnNameOverride'?: Record<keyof T, string>;
    /** List of columns by their key/property name that should be hidden in the managed data grid. */
    'hideColumn'?: (keyof T)[];
}
