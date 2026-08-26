import { DataGrid, DataGridBody, DataGridCell, DataGridHeader, DataGridHeaderCell, DataGridRow, type TableColumnDefinition, createTableColumn } from '@fluentui/react-components';

/** Structure of the managed data grid component's props. */
interface ManagedDataGridProps<T> {
    /** Configuration used to override the default behavior of the managed data grid component. */
    'configuration': never;
    /** React state object that manages the selected state of the data grid. */
    'selectionHandler': never;
    /** Items to be displayed in the data grid. */
    'items': T[];
    /** Optional React ref attached to the rendered parent div element for direct manipulation if required. */
    'ref'?: React.Ref<HTMLDivElement>;
}

/**
 * A simplified Fluent UI data grid component that reduces the set of manual steps needed to create a data gird with a full set of capabilities out of the box.
 * @param props Configuration used to render the managed data grid component.
 * @returns Rendered managed data grid component.
 */
export function ManagedDataGrid<T>(props: ManagedDataGridProps<T>): React.ReactNode {
    /** List of columns to be rendered in the data grid. */
    const columnList: TableColumnDefinition<T>[] = [];

    /** Flag that indicates what selection mode the data grid is in. */
    const selectionMode: 'none' | 'single' | 'multiple' = 'none';

    // Iterate through each property in the items object and process them as needed for rendering in the data grid.
    for (const key in props.items[0]) {
        // eslint-disable-next-line no-continue
        if (!Object.hasOwn(props.items[0], key)) { continue; }

        // Compute and add the column definition for the current property to the list of columns to be rendered in the data grid.
        columnList.push(createTableColumn<T>({
            'columnId': key,
            'compareCell': () => { },
            'renderCell': (item) => { return (item[key as keyof T]); },
            'renderHeaderCell': () => key
        }));
    }

    // Render the managed data grid
    return (
        <DataGrid
            items={ props.items }
            columns={ columnList }
            sortable
        >
            <DataGridHeader>
                <DataGridRow selectionCell={ { 'aria-label': selectionMode === 'multiple' ? 'Select all rows' : void 0 } }>
                    { ({ renderHeaderCell }) => <DataGridHeaderCell>{ renderHeaderCell() }</DataGridHeaderCell> }
                </DataGridRow>
            </DataGridHeader>
            <DataGridBody>
                { ({ item, rowId }) => (
                    <DataGridRow<Item>
                        key={ rowId }
                        selectionCell={ {
                            checkboxIndicator: { "aria-label": "Select row" },
                        } }
                    >
                        { ({ renderCell }) => (
                            <DataGridCell>{ renderCell(item) }</DataGridCell>
                        ) }
                    </DataGridRow>
                ) }
            </DataGridBody>
        </DataGrid>
    );
}
