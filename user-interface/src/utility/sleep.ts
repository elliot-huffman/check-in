/**
 * Pauses execution for a specified number of milliseconds.
 * @param milliseconds Number of milliseconds to wait before resolving the promise.
 * @returns Promise that only resolves after the specified number of milliseconds has passed.
 */
export function sleep(milliseconds: number): Promise<void> {
    /** Promise that resolves after the specified number of milliseconds. */
    const timedResolver = new Promise<void>((resolve) => {
        // Auto resolve the promise after the specified number of milliseconds has passed
        setTimeout(resolve, milliseconds);
    });

    // Return the promise to the caller so that it can be awaited
    return timedResolver;
}
