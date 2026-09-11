import { type CreateTableColumnOptions, DataGrid, DataGridBody, DataGridCell, DataGridHeader, DataGridHeaderCell, DataGridRow, type TableColumnDefinition, Text, createTableColumn } from '@fluentui/react-components';
import type { ManagedDataGridConfiguration } from '@/utility/types/components/ManagedDataGrid';
import { isValidElement } from 'react';

/** Structure of the managed data grid component's props. */
interface ManagedDataGridProps<T> {
    /** Configuration used to override the default behavior of the managed data grid component. */
    'renderConfiguration'?: ManagedDataGridConfiguration<T>;
    /** Configures the selection behavior of the data grid. If this is not provided, the data grid will not support selection. */
    'selection'?: {
        /** React state object that manages the selected state of the data grid. */
        'handler': (selection: T | T[] | null) => void;
        /**
         * Current selection of the data grid.
         *
         * If the value is:
         * - null or a single item, single selection mode is used in the data grid.
         * - any array of items, multi selection mode is used.
         */
        'current': T[] | T | null;
    };
    /** Items to be displayed in the data grid. */
    'items': T[];
    /** Optional React ref attached to the rendered parent div element for direct manipulation if required. */
    'ref'?: React.Ref<HTMLDivElement> | null;
}

/**
 * A simplified Fluent UI data grid component that reduces the set of manual steps needed to create a data gird with a full set of capabilities out of the box.
 * @param props Configuration used to render the managed data grid component.
 * @returns Rendered managed data grid component.
 */
export function ManagedDataGrid<T>(props: ManagedDataGridProps<T>): React.ReactNode {
    /** List of columns to be rendered in the data grid. */
    const columnList: TableColumnDefinition<T>[] = [];

    /** Selection mode flag that is used to configure the data grid to work with single or multiple selection. Or to disable it if no selection config is received. */
    let selectionMode: 'single' | 'multiselect' = 'single';

    // Determine the selection mode based on the provided selection configuration.
    if (props.selection && Array.isArray(props.selection)) { selectionMode = 'multiselect'; }

    // Iterate through each property in the items object and process them as needed for rendering in the data grid.
    for (const key in props.items[0]) {
        // eslint-disable-next-line no-continue
        if (!Object.hasOwn(props.items[0], key)) { continue; }

        // Skip rendering this column if it is specified to be hidden in the render configuration.
        // eslint-disable-next-line no-continue
        if (props.renderConfiguration?.hideColumn?.includes(key as keyof T)) { continue; }

        /** Computed options used to render the column of the data table. */
        const columnConfig: CreateTableColumnOptions<T> = {
            'columnId': key,
            /**
             * Dynamically renders the content of the cell based on the type of the data item.
             * @param item The data item for the current row.
             * @returns The content to be rendered in the cell.
             */
            'renderCell': (item: T): React.ReactNode => {
                // Render React element as is
                if (isValidElement(item)) { return item; }

                // Handle rendering for the primitive types
                switch (typeof item) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                    case 'bigint':
                        // Handle string compatible types by rendering them as text.
                        return <Text>{ item }</Text>;
                    case 'symbol':
                        // Handle symbol type by converting it to a string for display.
                        return <Text>{ item.toString() }</Text>;
                    case 'undefined':
                        // Handle undefined values by rendering an empty text element.
                        return <Text></Text>;
                    case 'object':
                        // Handle non-null object values by rendering their JSON string representation.
                        if (item !== null) { return <Text>{ JSON.stringify(item) }</Text>; }

                        // Return an empty text element for null values.
                        return <Text></Text>;
                    case 'function': {
                        /** Results of the callback invocation to be rendered. */
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                        const callbackResults = item() as unknown;

                        // Render React element as is
                        if (isValidElement(callbackResults)) { return callbackResults; }

                        // Handle rendering for the primitive types of the callback results
                        switch (typeof callbackResults) {
                            case 'string':
                            case 'number':
                            case 'boolean':
                            case 'bigint':
                                // Handle string compatible types by rendering them as text.
                                return <Text>{ callbackResults }</Text>;
                            case 'symbol':
                                // Handle symbol type by converting it to a string for display.
                                return <Text>{ callbackResults.toString() }</Text>;
                            case 'undefined':
                                // Handle undefined values by rendering an empty text element.
                                return <Text></Text>;
                            case 'object':
                                // Handle non-null object values by rendering their JSON string representation.
                                if (callbackResults !== null) { return <Text>{ JSON.stringify(callbackResults) }</Text>; }

                                // Return an empty text element for null values.
                                return <Text></Text>;
                            case 'function':
                                return <Text>Callback returned a function. Nested callbacks are not supported!</Text>;
                            default:
                                // Fall back to a safe generic message
                                return <Text>Unknown type of callback result!</Text>;
                        }
                    }
                    default:
                        // Fall back to a safe generic message
                        return <Text>Unknown data type provided!</Text>;
                }
            },
            /**
             * Renders the title of the column in the header cell of the data grid.
             * @returns The content to be rendered in the header cell.
             */
            'renderHeaderCell': () => {
                // Check if a column name override is provided in the render configuration.
                if (props.renderConfiguration?.columnNameOverride) { return props.renderConfiguration.columnNameOverride[key as keyof T]; }

                // If no column name override is provided, fall back to using the key as the column header.
                return key;
            }
        };

        // Enable the ability to sort the column if the column contains a sortable type
        switch (typeof props.items[0][key]) {
            case 'string':
                /**
                 * Compares two string values for sorting purposes.
                 * @param currentCell Value of the current cell that will be sorted.
                 * @param incomingCell Value of the incoming cell that will be compared against the current cell.
                 * @returns A number indicating the relative order of the two cells (0 for equality, a negative number if the current cell should come before the incoming cell, and a positive number if the current cell should come after the incoming cell).
                 */
                columnConfig.compare = (currentCell, incomingCell): number => (currentCell as string).localeCompare(incomingCell as string);

                // Stop execution to prevent fallthrough
                break;
            case 'number':
                /**
                 * Compares two number values for sorting purposes.
                 * @param currentCell Value of the current cell that will be sorted.
                 * @param incomingCell Value of the incoming cell that will be compared against the current cell.
                 * @returns A number indicating the relative order of the two cells (0 for equality, a negative number if the current cell should come before the incoming cell, and a positive number if the current cell should come after the incoming cell).
                 */
                columnConfig.compare = (currentCell, incomingCell): number => (currentCell as number) - (incomingCell as number);

                // Stop execution to prevent fallthrough
                break;
            case 'bigint':
                /**
                 * Compares BigInt values for sorting purposes.
                 * @param currentCell Value of the current cell that will be sorted.
                 * @param incomingCell Value of the incoming cell that will be compared against the current cell.
                 * @returns A number indicating the relative order of the two cells (0 for equality, a negative number if the current cell should come before the incoming cell, and a positive number if the current cell should come after the incoming cell).
                 */
                columnConfig.compare = (currentCell, incomingCell): number => {
                    // Both bigint values are the same, considered equal.
                    if (currentCell === incomingCell) { return 0; }

                    // Current cell is greater than incoming cell.
                    if (currentCell > incomingCell) { return 1; }

                    // Current cell is less than incoming cell.
                    return -1;
                };

                // Stop execution to prevent fallthrough
                break;
            case 'boolean':
                /**
                 * Compares two boolean values for sorting purposes.
                 * @param currentCell Value of the current cell that will be sorted.
                 * @param incomingCell Value of the incoming cell that will be compared against the current cell.
                 * @returns A number indicating the relative order of the two cells (0 for equality, a negative number if the current cell should come before the incoming cell, and a positive number if the current cell should come after the incoming cell).
                 */
                columnConfig.compare = (currentCell, incomingCell): number => {
                    // Compare boolean values: true is considered greater than false.

                    // Both boolean values are the same, considered equal.
                    if (currentCell === incomingCell) { return 0; }

                    // Current cell is true and incoming cell is false, considered greater.
                    if (currentCell === true && incomingCell === false) { return 1; }

                    // Current cell is false and incoming cell is true, considered lesser.
                    return -1;
                };

                // Stop execution to prevent fallthrough
                break;
            case 'symbol':
                /**
                 * Compares two symbol values for sorting purposes.
                 * @param currentCell Value of the current cell that will be sorted.
                 * @param incomingCell Value of the incoming cell that will be compared against the current cell.
                 * @returns A number indicating the relative order of the two cells (0 for equality, a negative number if the current cell should come before the incoming cell, and a positive number if the current cell should come after the incoming cell).
                 */
                columnConfig.compare = (currentCell, incomingCell): number => (currentCell as symbol).toString().localeCompare((incomingCell as symbol).toString());

                // Stop execution to prevent fallthrough
                break;
            case 'object':
                /**
                 * Compares two object values for sorting purposes.
                 * @param currentCell Value of the current cell that will be sorted.
                 * @param incomingCell Value of the incoming cell that will be compared against the current cell.
                 * @returns A number indicating the relative order of the two cells (0 for equality, a negative number if the current cell should come before the incoming cell, and a positive number if the current cell should come after the incoming cell).
                 */
                columnConfig.compare = (currentCell, incomingCell): number => {
                    // Compare object values by converting them to JSON strings and using localeCompare.

                    // Both cells are null, considered equal.
                    if (currentCell === null && incomingCell === null) { return 0; }

                    // Current cell is null and incoming cell is not null, considered lesser.
                    if (currentCell === null) { return -1; }

                    // Incoming cell is null and current cell is not null, considered greater.
                    if (incomingCell === null) { return 1; }

                    // Both cells are objects, compare their JSON string representations.
                    if (typeof currentCell === 'object' && typeof incomingCell === 'object') { return JSON.stringify(currentCell).localeCompare(JSON.stringify(incomingCell)); }

                    // Fall back to considering the cells equal if none of the above conditions are met.
                    return 0;
                };

                // Stop execution to prevent fallthrough
                break;
            default:
                // Non-sortable types are ignored
                break;
        }

        // Compute and add the column definition for the current property to the list of columns to be rendered in the data grid.
        columnList.push(createTableColumn(columnConfig));
    }

    // If a selection mode is specified, render the data grid with selection capabilities.
    if (props.selection) {
        // Render the managed data grid
        return (
            <DataGrid
                items={ props.items }
                columns={ columnList }
                selectionMode={ selectionMode }
                sortable
            >
                <DataGridHeader>
                    <DataGridRow selectionCell={ { 'aria-label': selectionMode === 'multiselect' ? 'Select all rows' : void 0 } }>
                        { ({ renderHeaderCell }) => <DataGridHeaderCell>{ renderHeaderCell() }</DataGridHeaderCell> }
                    </DataGridRow>
                </DataGridHeader>
                <DataGridBody<T>>
                    { ({ item, rowId }) => <DataGridRow<T> key={ rowId } selectionCell={ { 'checkboxIndicator': { 'aria-label': 'Select row' } } }>
                        { ({ renderCell }) => <DataGridCell>{ renderCell(item) }</DataGridCell> }
                    </DataGridRow>
                    }
                </DataGridBody>
            </DataGrid>
        );
    }

    // Render the managed data grid with no selection mode
    return (
        <DataGrid items={ props.items } columns={ columnList } sortable>
            <DataGridHeader>
                <DataGridRow>
                    { ({ renderHeaderCell }) => <DataGridHeaderCell>{ renderHeaderCell() }</DataGridHeaderCell> }
                </DataGridRow>
            </DataGridHeader>
            <DataGridBody<T>>
                { ({ item, rowId }) => <DataGridRow<T> key={ rowId }>
                    { ({ renderCell }) => <DataGridCell>{ renderCell(item) }</DataGridCell> }
                </DataGridRow>
                }
            </DataGridBody>
        </DataGrid>
    );
}
