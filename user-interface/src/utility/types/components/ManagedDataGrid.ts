/** Configuration used to get custom functionality out of the managed data grid. */
export interface ManagedDataGridConfiguration<T> {
    /**
     * Order in which the columns should appear.
     * The first column in this array appears first in the managed data grid and so on.
     * Columns are identified/targeted by their key/property name.
     *
     * Columns not listed in this array will be placed in whatever order the managed data grid decides after the listed columns.
     * Columns omitted from this list are not hidden. Use the `hideColumn` property to hide specific columns.
     */
    'columnOrder'?: (keyof T)[];
    /**
     * Overrides the display name for the columns in the managed data grid.
     * Does not update the property names of the items passed into the data grid to be rendered.
     *
     * Where the key is the name of the column/property to override.
     * Where the Value is the display name for the column to render.
     */
    'columnNameOverride'?: Partial<Record<keyof T, string>>;
    /** List of columns by their key/property name that should be hidden in the managed data grid. */
    'hideColumn'?: (keyof T)[];
}
