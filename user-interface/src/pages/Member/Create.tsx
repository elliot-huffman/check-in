import { Activity, useCallback, useState } from 'react';
import { Button, Field, Input, Subtitle2Stronger, Switch, Textarea, Title1 } from '@fluentui/react-components';
import { Layout, LayoutItem } from '@/components/LayoutSystem';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import { ManagedDataGrid } from '@/components/ManagedDataGrid';
import type { ManagedDataGridConfiguration } from '@/utility/types/components/ManagedDataGrid';
import type { Member } from '../../../../runtime/src/Utility/types/Member';
import { generateValidationResult } from '@/utility/validator';
import { isPhoneNumber } from '@/utility/guards/phoneNumber';

/**
 * Page that is used to create a new member.
 * @returns Rendered member creation page.
 */
export default function Page(): React.ReactNode {
    // React state used to store the first name of the new member.
    const [firstName, setFirstName] = useState('');

    // React state used to store the last name of the new member.
    const [lastName, setLastName] = useState('');

    // React state used to store the phone number of the new member.
    const [phoneNumber, setPhoneNumber] = useState('');

    // React state used to store the email address of the new member.
    const [emailAddress, setEmailAddress] = useState('');

    // React state used to store the date of birth of the new member.
    const [dateOfBirth, setDateOfBirth] = useState<Date | null | undefined>(null);

    // React state used to store the gender of the new member.
    const [gender, setGender] = useState('');

    // React state used to store whether the new member has a wheelchair requirement.
    const [homeAddressSectionVisibility, setHomeAddressSectionVisibility] = useState(false);

    // React state used to store the street address of the new member.
    const [streetAddress, setStreetAddress] = useState('');

    // React state used to store the city of the new member.
    const [city, setCity] = useState('');

    // React state used to store the state of the new member.
    const [state, setState] = useState('');

    // React state used to store the postal code of the new member.
    const [postalCode, setPostalCode] = useState('');

    // React state used to store the country of the new member.
    const [country, setCountry] = useState('');

    // React state used to store whether the new member has a wheelchair requirement.
    const [wheelchair, setWheelchair] = useState(false);

    // React state used to store whether the new member has a hearing impairment.
    const [hearingImpairment, setHearingImpairment] = useState(false);

    // React state used to store whether the new member has a visual impairment.
    const [visualImpairment, setVisualImpairment] = useState(false);

    // React state used to store whether the new member has a mobility impairment.
    const [mobilityImpairment, setMobilityImpairment] = useState(false);

    // React state used to store whether the new member has other accessibility requirements.
    const [otherAccessibilityRequirement, setOtherAccessibilityRequirement] = useState('');

    /** Validation state for the phone number input field, computed based on the current phone number value. */
    const phoneNumberValidation = generateValidationResult(phoneNumber, 'Invalid phone number!', isPhoneNumber);

    // React state used to store the first name of the new member.
    const [emergencyContactName, setEmergencyContactName] = useState('');

    // React state used to store the relationship of the emergency contact to the new member.
    const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('');

    // React state used to store the phone number of the new member.
    const [emergencyContactPhoneNumber, setEmergencyContactPhoneNumber] = useState('');

    /** Validation state for the emergency contact phone number input field, computed based on the current emergency contact phone number value. */
    const emergencyContactPhoneNumberValidation = generateValidationResult(emergencyContactPhoneNumber, 'Invalid phone number!', isPhoneNumber);

    // React state used to store the email address of the emergency contact for the new member.
    const [emergencyContactEmailAddress, setEmergencyContactEmailAddress] = useState('');

    // React state used to store the state of the new member.
    const [emergencyContactList, setEmergencyContactList] = useState<Member['emergencyContactList']>([]);

    /** Creates a new member based on the input provided by the end user. */
    const newMember = useCallback(async (): Promise<void> => {
        // Create a new member using the provided input values.
        await window.electronApi.MemberEngine.newMember({
            'accessibilityNeeds': {
                hearingImpairment,
                mobilityImpairment,
                'other': otherAccessibilityRequirement !== '' ? otherAccessibilityRequirement : null,
                visualImpairment,
                wheelchair
            },
            'birthDate': dateOfBirth ? dateOfBirth.toISOString() : '',
            'checkInLogList': [],
            'checkOutLogList': [],
            'email': emailAddress,
            emergencyContactList,
            firstName,
            gender,
            'homeAddress': homeAddressSectionVisibility
                ? {
                    city,
                    country,
                    postalCode,
                    state,
                    streetAddress
                }
                : null,
            'lastLogEntry': null,
            lastName,
            phoneNumber,
            'signatureList': []
        });
    }, [city, country, dateOfBirth, emailAddress, emergencyContactList, firstName, gender, hearingImpairment, homeAddressSectionVisibility, lastName, mobilityImpairment, otherAccessibilityRequirement, phoneNumber, postalCode, state, streetAddress, visualImpairment, wheelchair]);

    /** Adds a new emergency contact to the list of emergency contacts for the member. */
    function newEmergencyContact(): void {
        // Add a new emergency contact to the list of emergency contacts for the member.
        setEmergencyContactList([
            ...emergencyContactList,
            {
                'email': emergencyContactEmailAddress !== '' ? emergencyContactEmailAddress : null,
                'name': emergencyContactName,
                'phoneNumber': emergencyContactPhoneNumber !== '' ? emergencyContactPhoneNumber : null,
                'relationship': emergencyContactRelationship
            }
        ]);
    }

    /**
     * Removes the specified emergency contact from the list.
     * @param contactReference The emergency contact to be removed from the list.
     */
    function removeEmergencyContact(contactReference: Member['emergencyContactList'][number]): void {
        /** Index number of the contact in the emergency contact list to be removed. */
        const indexLocation = emergencyContactList.indexOf(contactReference);

        // Remove the specified emergency contact from the list by making a new array without that specific contact.
        setEmergencyContactList(emergencyContactList.filter((_value, item) => item !== indexLocation));
    }

    /** List of emergency contact with a remove button injected to be rendered in a managed data grid. */
    const emergencyContactGridList = emergencyContactList.map((contact) => ({
        ...contact,
        'removeButton': <Button onClick={ () => { removeEmergencyContact(contact); } }>Remove</Button>
    }));

    /** Make the data grid more human friendly. */
    const emergencyContactGridRenderConfig: ManagedDataGridConfiguration<typeof emergencyContactGridList[0]> = {
        'columnNameOverride': {
            'email': 'Email Address',
            'name': 'Name',
            'phoneNumber': 'Phone Number',
            'relationship': 'Relationship',
            'removeButton': 'Remove Contact'
        }
    };

    // Render the user creation page.
    return (
        <Layout>
            <LayoutItem>
                <Title1>Create a new member</Title1>
            </LayoutItem>
            <Layout direction="column">
                <LayoutItem>
                    <Field label="First Name" required>
                        <Input placeholder="Joe" appearance="underline" value={ firstName } onChange={ (_event, data) => { setFirstName(data.value); } } />
                    </Field>
                    <Field label="Last Name" required>
                        <Input placeholder="Smith" appearance="underline" value={ lastName } onChange={ (_event, data) => { setLastName(data.value); } } />
                    </Field>
                    <Field label="Phone Number" validationState={ phoneNumberValidation.state } validationMessage={ phoneNumberValidation.message }>
                        <Input placeholder="+1 123-456-7890" appearance="underline" value={ phoneNumber } onChange={ (_event, data) => { setPhoneNumber(data.value); } } />
                    </Field>
                    <Field label="eMail Address" >
                        <Input placeholder="joe@example.com" appearance="underline" value={ emailAddress } onChange={ (_event, data) => { setEmailAddress(data.value); } } />
                    </Field>
                    <Field label="Date of Birth" required>
                        <DatePicker placeholder="Select birth day" value={ dateOfBirth ?? null } onSelectDate={ (selectedDate) => { setDateOfBirth(selectedDate); } } />
                    </Field>
                    <Field label="Gender" >
                        <Input placeholder="Male/Female..." appearance="underline" value={ gender } onChange={ (_event, data) => { setGender(data.value); } } />
                    </Field>
                </LayoutItem>
                <LayoutItem>
                    <Switch label="Home Address" checked={ homeAddressSectionVisibility } onChange={ (_event, data) => { setHomeAddressSectionVisibility(data.checked); } } />
                    <Activity mode={ homeAddressSectionVisibility ? 'visible' : 'hidden' }>
                        <Field label="Street Address" required>
                            <Input placeholder="123 Sesame Street" appearance="underline" value={ streetAddress } onChange={ (_event, data) => { setStreetAddress(data.value); } } />
                        </Field>
                        <Field label="City" required>
                            <Input placeholder="New York" appearance="underline" value={ city } onChange={ (_event, data) => { setCity(data.value); } } />
                        </Field>
                        <Field label="State" required>
                            <Input placeholder="New York" appearance="underline" value={ state } onChange={ (_event, data) => { setState(data.value); } } />
                        </Field>
                        <Field label="Postal Code" required>
                            <Input placeholder="10123" appearance="underline" value={ postalCode } onChange={ (_event, data) => { setPostalCode(data.value); } } />
                        </Field>
                        <Field label="Country" required>
                            <Input placeholder="United States" appearance="underline" value={ country } onChange={ (_event, data) => { setCountry(data.value); } } />
                        </Field>
                    </Activity>
                </LayoutItem>
                <LayoutItem>
                    <Subtitle2Stronger>Accessibility Needs</Subtitle2Stronger>
                    <br />
                    <Switch label="Wheelchair" checked={ wheelchair } onChange={ (_event, data) => { setWheelchair(data.checked); } } />
                    <Switch label="Hearing Impairment" checked={ hearingImpairment } onChange={ (_event, data) => { setHearingImpairment(data.checked); } } />
                    <Switch label="Visual Impairment" checked={ visualImpairment } onChange={ (_event, data) => { setVisualImpairment(data.checked); } } />
                    <Switch label="Mobility Impairment" checked={ mobilityImpairment } onChange={ (_event, data) => { setMobilityImpairment(data.checked); } } />
                    <Field label="Other Accessibility Requirement">
                        <Textarea placeholder="If required..." value={ otherAccessibilityRequirement } onChange={ (_event, data) => { setOtherAccessibilityRequirement(data.value); } } />
                    </Field>
                </LayoutItem>
            </Layout>
            <LayoutItem>
                <Subtitle2Stronger>Emergency Contact List</Subtitle2Stronger>
                <LayoutItem invertParentDirection>
                    <Field label="Name" required>
                        <Input placeholder="Joe Smith" appearance="underline" value={ emergencyContactName } onChange={ (_event, data) => { setEmergencyContactName(data.value); } } />
                    </Field>
                    <Field label="Relationship" required>
                        <Input placeholder="Spouse" appearance="underline" value={ emergencyContactRelationship } onChange={ (_event, data) => { setEmergencyContactRelationship(data.value); } } />
                    </Field>
                    <Field label="Phone Number" validationState={ emergencyContactPhoneNumberValidation.state } validationMessage={ emergencyContactPhoneNumberValidation.message }>
                        <Input placeholder="+1 123-456-7890" appearance="underline" value={ emergencyContactPhoneNumber } onChange={ (_event, data) => { setEmergencyContactPhoneNumber(data.value); } } />
                    </Field>
                    <Field label="eMail Address" >
                        <Input placeholder="joe@example.com" appearance="underline" value={ emergencyContactEmailAddress } onChange={ (_event, data) => { setEmergencyContactEmailAddress(data.value); } } />
                    </Field>
                </LayoutItem>
                <LayoutItem>
                    <Button onClick={ newEmergencyContact }>Add Emergency Contact</Button>
                </LayoutItem>
                <ManagedDataGrid items={ emergencyContactGridList } renderConfiguration={ emergencyContactGridRenderConfig } />
            </LayoutItem>
            <br />
            <LayoutItem>
                <Button appearance="primary" onClick={ () => void newMember() }>Create</Button>
            </LayoutItem>
        </Layout>
    );
}
