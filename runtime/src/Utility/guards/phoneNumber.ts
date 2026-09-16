import { equals, type tags } from 'typia';

/**
 * Validates if a provided string follows the format of a phone number or not.
 * @param phoneNumber String that is to be checked if it is a phone number or not.
 * @returns Flag that indicates if the provided phone number is a valid E.164 phone number.
 */
export function isPhoneNumber(phoneNumber: string & tags.MinLength<2> & tags.MaxLength<64>): boolean {
    // #region Input validation
    if (!equals(phoneNumber)) { return false; }
    // #endregion Input validation

    /** Matches any non-digit character in the phone number string. */
    const nonDigitMatcher = /[^\d]/gu;

    /** Matches E164 phone number format without formatting. */
    const formattedNumberMatcher = /^(?=(?:\D*\d){2,15}\D*$)(?!\+?[\s().-]*0)\+?[\d\s().-]*\d$/u;

    // Ensure that only one plus sign exists in the phone number, if one exists.
    if (phoneNumber.split('+').length > 2) { return false; }

    // Ensure that if a plus sign exists, it must be the first character.
    if (phoneNumber.includes('+') && !phoneNumber.startsWith('+')) { return false; }

    /** Phone number without any other characters, only digits. */
    const numberOnly = phoneNumber.replace(nonDigitMatcher, '');

    // Checks if the provided number is a valid E.164 phone number.
    if (!formattedNumberMatcher.test(phoneNumber)) { return false; }

    // E.164: Up to 15 digits, first digit must not be zero
    return (
        numberOnly.length >= 2 &&
        numberOnly.length <= 15 &&
        !numberOnly.startsWith('0')
    );
}
