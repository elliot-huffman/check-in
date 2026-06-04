"use client";
import { Layout, LayoutItem } from "../_components/elements/LayoutSystem";
import { Button, Input, Text } from '@fluentui/react-components';
import { useDispatch, useSelector } from 'react-redux';
import { setInputValue, checkInInputSelector } from '../../store/components/elements/checkIn';
import type { InputProps } from '@fluentui/react-components';
import { useStyleList } from '../_components/styles/components/checkIn';
import { useState } from 'react';

/** GUID validation pattern */
const PATTERN = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

/**
 * Check in page.
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
    const isValid = PATTERN.test(inputValue);

    /** Status text displayed after attempting to submit a check-in request. */
    const [statusText, setStatusText] = useState<string>('');

    /** Handle input change. */
    const handleChange: InputProps['onChange'] = (_ev, data) => {
        dispatch(setInputValue(data.value));
    };

    /** Sends the valid user ID through the IPC bridge to the access control engine. */
    const handleSubmit = async (): Promise<void> => {
        /** Ensure that the value entered is a guid. */
        if (!isValid) {
            // Set the status text to inform the user that the input is invalid.
            setStatusText('Please enter a valid user ID.');

            return;
        }

        try {
            // Send the valid user ID through the IPC bridge to the access control engine.
            await window.electronApi.AccessControlEngine.checkIn(inputValue, ['manual-check-in']);
            
            // Set the status text to inform the user that the check-in request was successful.
            setStatusText('Check-in request sent successfully.');
        } catch (error) {
            // Set the status text to inform the user that the check-in request failed.
            const message = error instanceof Error ? error.message : 'Unable to submit check-in request.';
            
            // Set the status text to inform the user that the check-in request failed.
            setStatusText(message);
        }
    };

    return (
        <Layout>
                <Text>Lorem ipsum dolor sit amet</Text>
                <Layout >
                    <LayoutItem className={ styleList.row }>
                        <Input
                            className={ styleList.userIDEntry }
                            aria-label="Check in input"
                            placeholder="Please enter a User ID"
                            value={ inputValue }
                            onChange={ handleChange }
                        />
                        <Button appearance="primary" type="button" disabled={ !isValid } onClick={ handleSubmit }>Submit</Button>
                    </LayoutItem>
                    { isValid && (
                        <LayoutItem>
                            <Text className={ styleList.successText }>Valid ID entered</Text>
                        </LayoutItem>
                    ) }
                    { statusText && (
                        <LayoutItem>
                            <Text>{ statusText }</Text>
                        </LayoutItem>
                    ) }
                </Layout>
        </Layout>
    );
}
