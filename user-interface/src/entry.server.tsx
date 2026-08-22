import { type EntryContext, type RouterContextProvider, ServerRouter } from 'react-router';
import { PassThrough, type TransformCallback } from 'node:stream';
import { RendererProvider, SSRProvider, createDOMRenderer, renderToStyleElements } from '@fluentui/react-components';
import { renderToPipeableStream, renderToStaticMarkup } from 'react-dom/server';
import { createReadableStreamFromReadable } from '@react-router/node';

/** SSR timeout, after these milliseconds are met, the abort signal is sent to the render pipeline. */
export const streamTimeout = 5_000;

/** Exact element that represents the Fluent UI insertion point. */
const FLUENT_UI_INSERTION_POINT_TAG = '<meta name="fluentui-insertion-point" content="fluentui-insertion-point" />';

/** Matcher for the Fluent UI insertion point tag, used to identify where it is in the DOM. */
const FLUENT_UI_INSERTION_TAG_REGEX = new RegExp(FLUENT_UI_INSERTION_POINT_TAG.replaceAll(' ', '(\\s)*'), 'u');

/**
 * Handles the incoming request and returns a response after rendering the React application on the server side.
 * @param request The incoming HTTP request object.
 * @param responseStatusCode The initial HTTP response status code to be sent back to the client.
 * @param responseHeaders The HTTP response headers to be sent back to the client.
 * @param routerContext The context object for the React Router, containing information about the current route and navigation state.
 * @param _loadContext Not used in this function.
 * @returns A Promise that resolves to the HTTP response object after rendering the React application on the server side.
 */
export default async function handleRequest(request: Request, responseStatusCode: number, responseHeaders: Headers, routerContext: EntryContext, _loadContext: RouterContextProvider): Promise<Response> {
    // https://httpwg.org/specs/rfc9110.html#HEAD
    if (request.method.toUpperCase() === 'HEAD') {
        return new Response(null, {
            'headers': responseHeaders,
            'status': responseStatusCode
        });
    }

    /** Fluent UI renderer function for Griffel/CSS compile support. */
    const renderer = createDOMRenderer();

    /**
     * Renders the response for the incoming request, handling the server-side rendering of the React application and managing the response stream.
     * @param resolve Function to call when the response is successfully rendered.
     * @param reject Function to call when an error occurs during rendering.
     */
    function renderResponse(resolve: (value: Response | PromiseLike<Response>) => void, reject: (reason?: Error) => void): void {
        /** Computed response code that may be modified during the render process. This will be sent back to the caller in the response headers. */
        let computedResponseCode = responseStatusCode;

        /** Flag that indicates if the HTML has been rendered or not. */
        let shellRendered = false;

        /** Flag to indicate that the Griffel.js styles have been compiled and added to the head element. */
        let isStyleExtracted = false;

        /** Event name to configure based on the mode of the compile process. */
        const eventSelector = routerContext.isSpaMode ? 'onAllReady' : 'onShellReady';

        /** ID of the timer that is used for the compile timeout/abort failsafe. */
        let timerId: ReturnType<typeof setTimeout> | null = null;

        const { pipe, abort } = renderToPipeableStream(
            <RendererProvider renderer={ renderer }>
                <SSRProvider>
                    <ServerRouter context={ routerContext } url={ request.url } />
                </SSRProvider>
            </RendererProvider>,
            {
                /** Event handler for when the HTML shell is ready or when all content is ready, depending on the mode. */
                [eventSelector](): void {
                    // Indicate that the HTML has been rendered and the response is ready to be sent back to the core router.
                    shellRendered = true;

                    /** Render pipeline for the HTML body. */
                    const body = new PassThrough({
                        /**
                         * Finalizes the transform stream, performing any necessary cleanup before the stream ends.
                         * @param callback The callback to signal completion of the finalization step.
                         */
                        'final': (callback: TransformCallback): void => {
                            // Disable the abort timer since the render has completed
                            if (timerId !== null) {
                                // Stop the timer
                                clearTimeout(timerId);

                                // Reset the timer ID tracker for the next render process
                                timerId = null;
                            }

                            // Execute the callback passed to this callback to move processing to the next step in the render pipeline.
                            callback();
                        },
                        /**
                         * Checks the incoming chunk of data to ensure it is a valid type (string or Buffer) and processes it to inject the Griffel.js compiled styles if necessary.
                         * @param chunk The incoming chunk of HTML data to be processed, which can be a string or Buffer.
                         * @param _encoding The encoding of the incoming chunk.
                         * @param callback The callback to signal completion of the transformation.
                         */
                        'transform': (chunk: unknown, _encoding: BufferEncoding, callback: TransformCallback): void => {
                            // #region Input Validation

                            // Ensure the chunk is a known type before processing it.
                            if (typeof chunk !== 'string' && !Buffer.isBuffer(chunk)) {
                                // Send an error up the pipeline to indicate that the chunk type is invalid and cannot be processed.
                                callback(new TypeError('Invalid chunk type received in the render pipeline. Expected a string or Buffer.', { 'cause': 'Input Validation!' }));

                                // Stop execution to prevent fallthrough
                                return;
                            }
                            // #endregion Input Validation

                            /** Incoming content to process with the Griffel.js content if necessary. */
                            let computedChunk = typeof chunk !== 'string' ? chunk.toString() : chunk;

                            /** Compiled CSS in string (text). Not in a DOM object parsed format. */
                            const serializedCss = renderToStaticMarkup(<>{ renderToStyleElements(renderer) }</>);

                            // Add the Griffel.js compiled styles if the current set of HTML content contains the Fluent UI insertion point tag and the styles have not already been added.
                            if (!isStyleExtracted && FLUENT_UI_INSERTION_TAG_REGEX.test(computedChunk)) {
                                // Add the Griffel.js compiled styles to the HTML content after the Fluent UI insertion point tag.
                                computedChunk = computedChunk.replace(FLUENT_UI_INSERTION_TAG_REGEX, `${ FLUENT_UI_INSERTION_POINT_TAG }${ serializedCss }`);

                                // Indicate that Griffel.js compiled styles have been injected to prevent duplicate injections
                                isStyleExtracted = true;
                            }

                            // Send the mutated chunk to the next step in the render pipeline
                            callback(null, computedChunk);
                        }
                    });

                    /** Stream used to allow for lazy loading of the HTML chunk. */
                    const stream = createReadableStreamFromReadable(body);

                    // Indicate that the response is HTML content
                    responseHeaders.set('Content-Type', 'text/html');

                    // Add the compiled body to the response stream
                    pipe(body);

                    // Send the computed response back to the core router
                    resolve(new Response(stream, {
                        'headers': responseHeaders,
                        'status': computedResponseCode
                    }));
                },
                /**
                 * Event handler for when an error occurs during the server-side rendering process.
                 * @param error The error that occurred.
                 */
                'onError': (error: unknown) => {
                    // Indicate a server side compile issue
                    computedResponseCode = 500;

                    // If the render step is in Node, log to console, otherwise the error will be logged in the browser.
                    // eslint-disable-next-line no-console
                    if (shellRendered) { console.error(error); }
                },
                /**
                 * Event handler for when an error occurs during the server-side rendering process before the HTML shell is ready.
                 * @param error The error that occurred.
                 */
                'onShellError': (error: unknown) => {
                    /** Coerced error to ensure it is an instance of Error for deep node.js error handling compatibility. */
                    const computedError = error instanceof Error ? error : new Error('Unknown error occurred during server-side rendering.');

                    // Ensure that a Node.js error is logged to the console for debugging purposes.
                    reject(computedError);
                }
            }
        );

        // Start the timeout counter to abort the render process if it exceeds the specified timeout duration to prevent an infinite render.
        timerId = setTimeout(() => { abort(); }, streamTimeout + 1000);
    }

    // Wrap the render pipeline in a promise to allow async renders and to be able to terminate the render process with a timeout if it exceeds the specified duration to prevent an infinite render.
    return new Promise<Response>(renderResponse);
}
