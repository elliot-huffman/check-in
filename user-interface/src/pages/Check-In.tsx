import { Activity, type ChangeEvent, useState } from 'react';
import { Button, Input, type InputOnChangeData, Text, Title1 } from '@fluentui/react-components';
import { Layout, LayoutItem } from '@/components/LayoutSystem';
import { checkInInputSelector, setInputValue } from '@/store/components/pages/checkIn';
import { useDispatch, useSelector } from 'react-redux';
import { useStyleList } from '@/styles/pages/CheckIn';

/** GUID/UUID validation pattern. */
const guidMatcher = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/iu;

/**
 * Check in page for the access control system.
 * @returns Rendered check in page.
 */
export default function Page(): React.ReactNode {
    /** Style list for the component. */
    const styleList = useStyleList();

    /** Redux dispatch function. */
    const dispatch = useDispatch();

    /** Selected input value from the Redux store. */
    const inputValue = useSelector(checkInInputSelector);

    /** Flag indicating if the input is valid. */
    const isValid = guidMatcher.test(inputValue);

    /** Status text displayed after attempting to submit a check-in request. */
    const [statusText, setStatusText] = useState<string>('');

    /**
     * Handles changes to the input field, updating the Redux store with the new value.
     * @param _event Event object from the input change event (unused).
     * @param data Data object containing the new value of the input field.
     */
    function handleChange(_event: ChangeEvent<HTMLInputElement>, data: InputOnChangeData): void {
        // Update the Redux store with the new input value.
        dispatch(setInputValue(data.value));
    }

    /** Sends the valid user ID through the IPC bridge to the access control engine. */
    async function handleSubmit(): Promise<void> {
        /** Ensure that the value entered is a UUID. */
        if (!isValid) {
            // Set the status text to inform the user that the input is invalid.
            setStatusText('Please enter a valid user ID.');
        } else {
            // Gracefully attempt to sign in the end user
            try {
                // Send the valid user ID through the IPC bridge to the access control engine.
                await window.electronApi.AccessControlEngine.checkIn(inputValue, ['testing']);

                // Set the status text to inform the user that the check-in request was successful.
                setStatusText('Check-in request sent successfully.');
            } catch (error) {
                /** Sanitized error message. */
                const message = error instanceof Error ? error.message : 'Unable to submit check-in request.';

                // Set the status text to inform the user that the check-in request failed.
                setStatusText(message);
            }
        }
    }

    // Render the check in page
    return (
        <Layout align="center" justify="center" className={ styleList.mainContainer }>
            <LayoutItem className={ styleList.title }>
                <Title1>Access Control Check-In</Title1>
            </LayoutItem>
            <LayoutItem gap="extra-large">
                <Input appearance="underline" placeholder="User ID" value={ inputValue } onChange={ handleChange } className={ styleList.input } />
                <Button appearance="primary" type="button" disabled={ !isValid } onClick={ () => void handleSubmit() }>Submit</Button>
            </LayoutItem>
            <LayoutItem>
                <Text>Scan your barcode</Text>
            </LayoutItem>
            <Activity mode={ isValid ? 'visible' : 'hidden' }>
                <LayoutItem>
                    <Text className={ styleList.successText }>Valid ID entered</Text>
                </LayoutItem>
            </Activity>
            <Activity mode={ statusText ? 'visible' : 'hidden' }>
                <LayoutItem>
                    <Text>{ statusText }</Text>
                </LayoutItem>
            </Activity>
        </Layout>
    );
}
