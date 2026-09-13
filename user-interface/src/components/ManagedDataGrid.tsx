import { type CreateTableColumnOptions, DataGrid, DataGridBody, DataGridCell, DataGridHeader, DataGridHeaderCell, type DataGridProps, DataGridRow, type DataGridRowProps, type OnSelectionChangeData, type TableColumnDefinition, Text, createTableColumn } from '@fluentui/react-components';
import type { ManagedDataGridConfiguration } from '@/utility/types/components/ManagedDataGrid';
import { isValidElement } from 'react';

/** Structure of the single selection configuration for the managed data grid component. */
export interface SingleSelect<T> {
    /** Flag that indicates the selection mode is a single selection. */
    'mode': 'single';
    /** React state object that manages the selected state of the data grid. */
    'handler': (selection: T | undefined) => void;
}

/** Structure of the multiple selection configuration for the managed data grid component. */
export interface MultiSelect<T> {
    /** Flag that indicates the selection mode is a multiple selection. */
    'mode': 'multiselect';
    /** React state object that manages the selected state of the data grid. */
    'handler': (selection: T[] | undefined) => void;
}

/** Structure of the managed data grid component's props. */
export interface ManagedDataGridProps<T> {
    /** Configuration used to override the default behavior of the managed data grid component. */
    'renderConfiguration'?: ManagedDataGridConfiguration<T>;
    /** Configures the selection behavior of the data grid. If this is not provided, the data grid will not support selection. */
    'selection'?: SingleSelect<T> | MultiSelect<T>;
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
                /** Extracted value of the current cell to be rendered. */
                const cellValue = item[key as keyof T];

                // Render React element as is
                if (isValidElement(cellValue)) { return cellValue; }

                // Handle rendering for the primitive types
                switch (typeof cellValue) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                    case 'bigint':
                        // Handle string compatible types by rendering them as text.
                        return <Text>{ cellValue }</Text>;
                    case 'symbol':
                        // Handle symbol type by converting it to a string for display.
                        return <Text>{ cellValue.toString() }</Text>;
                    case 'undefined':
                        // Handle undefined values by rendering an empty text element.
                        return <Text></Text>;
                    case 'object':
                        // Handle non-null object values by rendering their JSON string representation.
                        if (cellValue !== null) { return <Text>{ JSON.stringify(cellValue) }</Text>; }

                        // Return an empty text element for null values.
                        return <Text></Text>;
                    case 'function': {
                        /** Results of the callback invocation to be rendered. */
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                        const callbackResults = cellValue() as unknown;

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
                columnConfig.compare = (currentCell, incomingCell): number => (currentCell[key as keyof T] as string).localeCompare(incomingCell[key as keyof T] as string);

                // Stop execution to prevent fallthrough
                break;
            case 'number':
                /**
                 * Compares two number values for sorting purposes.
                 * @param currentCell Value of the current cell that will be sorted.
                 * @param incomingCell Value of the incoming cell that will be compared against the current cell.
                 * @returns A number indicating the relative order of the two cells (0 for equality, a negative number if the current cell should come before the incoming cell, and a positive number if the current cell should come after the incoming cell).
                 */
                columnConfig.compare = (currentCell, incomingCell): number => (currentCell[key as keyof T] as number) - (incomingCell[key as keyof T] as number);

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
                    if (currentCell[key as keyof T] === incomingCell[key as keyof T]) { return 0; }

                    // Current cell is greater than incoming cell.
                    if (currentCell[key as keyof T] > incomingCell[key as keyof T]) { return 1; }

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
                    if (currentCell[key as keyof T] === incomingCell[key as keyof T]) { return 0; }

                    // Current cell is true and incoming cell is false, considered greater.
                    if (currentCell[key as keyof T] === true && incomingCell[key as keyof T] === false) { return 1; }

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
                columnConfig.compare = (currentCell, incomingCell): number => (currentCell[key as keyof T] as symbol).toString().localeCompare((incomingCell[key as keyof T] as symbol).toString());

                // Stop execution to prevent fallthrough
                break;
            case 'object': {
                /** Flag that indicates if comparison should be disabled due to the presence of React elements in the column. */
                let reactElementFound = false;

                // Check for react elements in each row to determine if comparison should be enabled
                for (const item of props.items) {
                    // Check if the current cell contains a React element.
                    if (isValidElement(item[key as keyof T])) {
                        // Set the flag to indicate that a React element was found in the column.
                        reactElementFound = true;

                        // Stop checking further rows as we have already found a React element.
                        break;
                    }
                }

                // Don't enable comparison on react elements
                if (reactElementFound) { break; }

                /**
                 * Compares two object values for sorting purposes.
                 * @param currentCell Value of the current cell that will be sorted.
                 * @param incomingCell Value of the incoming cell that will be compared against the current cell.
                 * @returns A number indicating the relative order of the two cells (0 for equality, a negative number if the current cell should come before the incoming cell, and a positive number if the current cell should come after the incoming cell).
                 */
                columnConfig.compare = (currentCell, incomingCell): number => {
                    // Compare object values by converting them to JSON strings and using localeCompare.

                    // Both cells are null, considered equal.
                    if (currentCell[key as keyof T] === null && incomingCell[key as keyof T] === null) { return 0; }

                    // Current cell is null and incoming cell is not null, considered lesser.
                    if (currentCell[key as keyof T] === null) { return -1; }

                    // Incoming cell is null and current cell is not null, considered greater.
                    if (incomingCell[key as keyof T] === null) { return 1; }

                    // Both cells are objects, compare their JSON string representations.
                    if (typeof currentCell[key as keyof T] === 'object' && typeof incomingCell[key as keyof T] === 'object') {
                        // Render the JSON string representations of the objects for comparison.
                        return JSON.stringify(currentCell[key as keyof T]).localeCompare(JSON.stringify(incomingCell[key as keyof T]));
                    }

                    // Fall back to considering the cells equal if none of the above conditions are met.
                    return 0;
                };

                // Stop execution to prevent fallthrough
                break;
            }
            default:
                // Non-sortable types are ignored
                break;
        }

        // Compute and add the column definition for the current property to the list of columns to be rendered in the data grid.
        columnList.push(createTableColumn(columnConfig));
    }

    /**
     * Handles the selection change event for the data grid.
     *
     * Converts the selected items from index-based selection to the corresponding data items.
     * Sets the selected rows based on the selection change.
     * @param _event The event object associated with the selection change.
     * @param data The data object containing information about the selection change.
     */
    function onSelectionChange(_event: unknown, data: OnSelectionChangeData): void {
        // Only process selection changes if selection is enabled.
        if (props.selection) {
            /** List of selected items based on the current selection indices. */
            const selectedItems: T[] = [];

            // Iterate through all of the selected indexes and extract the corresponding data items from the props.items array.
            for (const selectionAtIndex of data.selectedItems) {
                /** Item extracted from the props.items array based on the current selection index. */
                const extractedItem = props.items[selectionAtIndex as number];

                // Only add an item to the selected item list if it exists.
                if (extractedItem) { selectedItems.push(extractedItem); }
            }

            // Invoke the selection handler with the appropriate selected items based on the selection mode.
            if (props.selection.mode === 'multiselect') {
                // Indicate all of the selected items
                props.selection.handler(selectedItems);
            } else {
                // Indicate only the first selected item since only a single item can be selected in single selection mode.
                props.selection.handler(selectedItems[0]);
            }
        }
    }

    /** Properties to be applied to the data grid component itself. */
    const dataGridProps: DataGridProps = {
        'columns': columnList,
        'items': props.items,
        'sortable': true
    };

    /** Properties to be applied to the header row of the data grid. */
    const headerRowProps: Omit<DataGridRowProps, 'children'> = {};

    /** Properties to be applied to the data rows of the data grid. */
    const dataRowProps: Omit<DataGridRowProps, 'children'> = {};

    // Inject the selection properties into the data grid props and row props if selection is enabled.
    if (props.selection) {
        // Set the selection mode and selection change handler for the data grid.
        dataGridProps.selectionMode = props.selection.mode;

        // Assign the selection change handler to the data grid props.
        dataGridProps.onSelectionChange = onSelectionChange;

        // Apply the selection cell properties to the header and data rows.
        headerRowProps.selectionCell = { 'aria-label': props.selection.mode === 'multiselect' ? 'Select all rows' : void 0 };

        // Apply the selection cell properties to the data rows.
        dataRowProps.selectionCell = { 'checkboxIndicator': { 'aria-label': 'Select row' } };
    }

    // Render the managed data grid with no selection mode
    return (
        <DataGrid { ...dataGridProps } >
            <DataGridHeader>
                <DataGridRow { ...headerRowProps }>
                    { ({ renderHeaderCell }) => <DataGridHeaderCell>{ renderHeaderCell() }</DataGridHeaderCell> }
                </DataGridRow>
            </DataGridHeader>
            <DataGridBody<T>>
                { ({ item, rowId }) => <DataGridRow<T> key={ rowId } { ...dataRowProps }>
                    { ({ renderCell }) => <DataGridCell>{ renderCell(item) }</DataGridCell> }
                </DataGridRow>
                }
            </DataGridBody>
        </DataGrid>
    );
}
