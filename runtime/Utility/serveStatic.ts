import { join, normalize, parse } from 'node:path';
import { assertGuardEquals } from 'typia';
import { readFile } from 'node:fs/promises';

/**
 * Lorem ipsum.
 * @param request Incoming web request captured from the electron client to be served with static HTML content.
 * @param staticContentDirectory Directory containing the static HTML content to be served.
 * @returns Rendered HTML response that is statically rendered.
 */
export async function sendStaticHtmlContent(request: Request, staticContentDirectory: string): Promise<Response> {
    // #region Input validation
    if (!(request instanceof Request)) { throw new TypeError('The provided request is not an instance of Request!', { 'cause': 'Input validation!' }); }

    assertGuardEquals(staticContentDirectory);
    // #endregion Input validation

    /** Parsed URL of the incoming request. */
    const currentUrl = new URL(request.url);

    /** File from disk to read back to the caller. */
    let computedFilePath = join(staticContentDirectory, currentUrl.pathname);

    // Check if the request is for a directory and if so, serve the index.html file within that directory since that is how HTTP serves directories.
    if (
        computedFilePath.endsWith('/') ||
        computedFilePath.endsWith('\\')
    ) {
        // Since directories are rendered as HTML by React.JS, the file path needs to serve the index.html file since in HTTP that is how directories are served.
        computedFilePath = join(computedFilePath, 'index.html');
    }

    // Ensure that the path is useable by the operating system the app is running from and that it is in full path mode instead of relative mode.
    computedFilePath = normalize(computedFilePath);

    /** Content of the file to be served. */
    let fileContent: Buffer = Buffer.from('');

    // Gracefully attempt to read the file from disk and fall back to 404
    try {
        // Attempt to read the file from disk
        fileContent = await readFile(computedFilePath);
    } catch (error) {
        // Check if the error is due to the file not being found
        if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
            // Load the Next.js 404 page if the requested file is not present.
            fileContent = await readFile(join(staticContentDirectory, '404.html'));
        }
    }

    /** Response to send to the caller after calculations are complete. */
    const response = new Response(fileContent as BufferSource);

    // Set the correct headers depending on the type of file being served to ensure proper client handling
    switch (parse(computedFilePath).ext) {
        case '.html':
            // Indicate the file is Hyper Text Markup Language
            response.headers.set('Content-Type', 'text/html');

            // Stop execution to prevent fallthrough
            break;
        case '.css':
            // Indicate the file is Cascading Style Sheets
            response.headers.set('Content-Type', 'text/css');

            // Stop execution to prevent fallthrough
            break;
        case '.js':
            // Indicate the file is JavaScript
            response.headers.set('Content-Type', 'application/javascript');

            // Stop execution to prevent fallthrough
            break;
        default:
            // For unknown HTTP file types, service it as plain text to reduce risk of malicious injection being executed
            response.headers.set('Content-Type', 'text/plain');

            // Stop execution to prevent fallthrough
            break;
    }

    // Return the rendered HTML content to the caller
    return response;
}
