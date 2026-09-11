/** Recursively marks nested properties as readonly while preserving callable function types. */
export type DeepReadonly<T> = T extends (...arguments_: never[]) => unknown ? T : T extends object ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> } : T;

/**
 * Recursively freezes a value and all nested object or function properties.
 * This produces a deeply readonly view of the provided input for TypeScript consumers.
 * The object graph is expected to be acyclic because circular references will recurse indefinitely.
 * @param input Value to freeze in place.
 * @returns The same value after recursively freezing reachable nested properties.
 */
export function deepFreeze<T>(input: T): DeepReadonly<T> {
    // Start sub-iteration if the incoming item is an object or function and is not null (since typeof null is 'object' in JavaScript)
    if (
        (input && typeof input === 'object') ||
        typeof input === 'function'
    ) {
        // Iterate through the provided object
        for (const key in input) {
            // Skip processing prototype properties
            // eslint-disable-next-line no-continue
            if (!Object.hasOwn(input, key)) { continue; }

            /** Item to freeze if it is an object or function. */
            const value = input[key as keyof T];

            // Check if the value is an object, function and not null
            if (
                (value && typeof value === 'object') ||
                typeof value === 'function'
            ) {
                // Recurse into the value to freeze nested objects/functions before freezing the parent object
                deepFreeze(value);
            }
        }
    }

    // Freeze the input content after recursively freezing all nested objects/functions.
    return Object.freeze(input) as DeepReadonly<T>;
}
