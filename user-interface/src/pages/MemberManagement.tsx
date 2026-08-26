import { DataGrid } from '@fluentui/react-components';
import { useState } from 'react';

/**
 * Initial entry point for the member management section of the application.
 * @returns Rendered member management landing page.
 */
export default function Page(): React.ReactNode {
    /** Currently selected member in the data grid. */
    const [selection, setSelection] = useState<Member[] | undefined>();

    // Render the member management page.
    return (
        <DataGrid>

        </DataGrid>
    );
}
