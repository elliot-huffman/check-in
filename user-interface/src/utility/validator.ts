import { assertGuardEquals } from 'typia';

/** Represents the validation state of an input field, including its status and associated message. */
interface validationResult {
    /** Validation state of the input field, indicating success, error, or none. */
    'state': 'success' | 'error' | 'none';
    /** Validation message providing additional context for the validation state. */
    'message': string;
}

/**
 * Generates a validation result for the given input value using the provided guard callback.
 * @param inputValue The value to be validated.
 * @param errorMessage The error message to be used if the validation fails.
 * @param guardCallback A callback function that performs the validation check on the input value.
 * @returns The validation result indicating the state and message of the input value.
 */
export function generateValidationResult<T>(inputValue: T, errorMessage: string, guardCallback: (inputValue: T) => boolean): validationResult {
    // #region Input Validation
    assertGuardEquals(errorMessage);
    // #endregion Input Validation

    /** Resultant state of the input value validation based on the current input. */
    const computedState: validationResult = {
        'message': '',
        'state': 'none'
    };

    // Validate if the incoming input value is in a correct format.
    if (inputValue === '') {
        // Skip processing the validation state since no data exists.
        return computedState;
    } else if (guardCallback(inputValue)) {
        // Indicate a proper input value is present
        computedState.state = 'success';
    } else {
        // Set the validation state to be in error red since the input value is invalid.
        computedState.state = 'error';

        // Indicate what is wrong with the input value.
        computedState.message = errorMessage;
    }

    // Return the computed validation state for the input value.
    return computedState;
}
