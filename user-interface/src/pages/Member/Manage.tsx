import { AddRegular, ArrowClockwiseRegular, DeleteRegular } from '@fluentui/react-icons';
import { Button, Title1 } from '@fluentui/react-components';
import { Layout, LayoutItem } from '@/components/LayoutSystem';
import { ManagedDataGrid, type MultiSelect } from '@/components/ManagedDataGrid';
import { useCallback, useEffect, useState } from 'react';
import type { Member } from '../../../../runtime/src/Utility/types/Member';
import { useNavigate } from 'react-router';

/**
 * Initial entry point for the member management section of the application.
 * @returns Rendered member management landing page.
 */
export default function Page(): React.ReactNode {
    /** Router used to navigate to the selected page. */
    const router = useNavigate();

    /** Currently selected member in the data grid. */
    const [memberSelection, setMemberSelection] = useState<Member[] | undefined>();

    // Local state that keeps track of the current list of members
    const [memberList, setMemberList] = useState<Member[]>([]);

    const [isRemoving, setIsRemoving] = useState(false);

    /** Selection configuration for the data grid. */
    const selectionConfig: MultiSelect<Member> = {
        'handler': setMemberSelection,
        'mode': 'multiselect'
    };

    /** Removes the selected members from the check in app. */
    async function removeSelectedMember(): Promise<void> {
        // Only proceed if there is a selection and no removal is currently in progress
        if (typeof memberSelection !== 'undefined' && !isRemoving) {
            // Set the flag to indicate that a removal is in progress
            setIsRemoving(true);

            // Iterate over each member that needs to be removed and remove them
            for (const member of memberSelection) {
                // Remove the specified member from the system.
                await window.electronApi.MemberEngine.removeMember(member.id);
            }

            // Set the flag to indicate that the removal process has completed.
            setIsRemoving(false);
        }
    }

    /** Function used to retrieve an updated list of users from the member management system. */
    const getMemberList = useCallback(async (): Promise<void> => {
        /** List of members that are currently registered in the system. */
        const rawMemberList = await window.electronApi.MemberEngine.getMember();

        // Update the local state with the retrieved member list.
        setMemberList(rawMemberList);
    }, []);

    // Load the initial member list when the page loads
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void getMemberList(); }, [getMemberList]);

    // Render the member management page.
    return (
        <Layout>
            <Title1>Manage Existing Members</Title1>
            <br />
            <LayoutItem>
                <Button appearance="subtle" icon={ <AddRegular /> } onClick={ () => { void router('/Member/Create'); } }>Create</Button>
                <Button appearance="subtle" icon={ <ArrowClockwiseRegular /> } onClick={ () => { void getMemberList(); } }>Refresh</Button>
                <Button appearance="subtle" icon={ <DeleteRegular /> } disabled={ memberSelection === void 0 || memberSelection.length === 0 } onClick={ () => void removeSelectedMember() }>Remove</Button>
            </LayoutItem>
            <ManagedDataGrid<Member> selection={ selectionConfig } items={ memberList } />
        </Layout>
    );
}
