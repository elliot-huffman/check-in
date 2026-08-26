import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Suspense, useCallback, useEffect, useMemo } from 'react';
import { setTheme, themeModeSelector } from '@/store/components/themeProvider';
import Template from '@/components/template';
import { store } from '@/store/store';
import { useStyleList } from '@/styles/root';

/**
 * Renders the root layout/HTML of the application, wrapping it with Fluent UI support and handling theme changes based on user system preferences.
 * @returns Renders the root HTML with Fluent UI support, along with any provided children pages/components.
 */
function RootContent(): React.ReactNode {
    /** Function to update global redux state in a render optimized way. */
    const dispatch = useDispatch();

    /** Flag that indicates which theme mode is requested. */
    const themeMode = useSelector(themeModeSelector);

    /** Compiled styles for the root layout. */
    const compiledStyles = useStyleList();

    /**
     * Checks the current metadata to see if the user has a system preference for a light or dark theme and updates the global state accordingly.
     * @param event Metadata that describes if the current theme mode is requested to be 'dark' or not.
     */
    const themeChangeListener = useCallback((event: MediaQueryListEvent): void => {
        // Update the theme in the global state based on the user's updated system preference
        dispatch(setTheme(event.matches ? 'dark' : 'light'));
    }, [dispatch]);

    // Set the current theme based on the user's system preference and listen for changes to the system theme preference to update the theme in real time.
    useEffect(() => {
        /** Initial theme setup based on user's system preference. */
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        // Set the initial theme based on the user's system preference
        dispatch(setTheme(darkModeMediaQuery.matches ? 'dark' : 'light'));

        // Listen for changes in the user's system theme preference and update the theme accordingly
        darkModeMediaQuery.addEventListener('change', themeChangeListener);

        // Remove the event listener on unmount to prevent memory leaks
        return (): void => { darkModeMediaQuery.removeEventListener('change', themeChangeListener); };
    }, [dispatch, themeChangeListener]);

    /**
     * Fluent UI theme to render for the entire application.
     * High contrast support is auto selected/implemented outside of light/dark modes by Fluent itself.
     */
    const selectedTheme = useMemo(() => {
        // If a dark theme is requested, return the dark fluent theme
        if (themeMode === 'dark') { return webDarkTheme; }

        // Default to a light theme for all other modes
        return webLightTheme;
    }, [themeMode]);

    // Render the core HTML with Fluent UI support available from the very root.
    return (
        <html lang="en" className={ compiledStyles.html }>
            <head>
                <title>ElHuff - Check In</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Application that checks people into and out of events, buildings, or systems." />
                <Meta />
                <Links />
                {/* Anchor location for the Fluent UI CSS styles. */ }
                <meta name="fluentui-insertion-point" content="fluentui-insertion-point" />
            </head>
            <body className={ compiledStyles.body }>
                <FluentProvider theme={ selectedTheme } className={ compiledStyles.themeProvider }>
                    <Suspense fallback="Loading...">
                        <Template>
                            <Outlet />
                        </Template>
                    </Suspense>
                </FluentProvider>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

/**
 * Renders the root layout/HTML of the application, wrapping it with the Redux Provider to make the store available throughout the app.
 * @returns Rendered root layout with Redux support.
 */
export default function Root(): React.ReactNode {
    // Render the core HTML with redux support available from the very root.
    return (
        <Provider store={ store }>
            <RootContent />
        </Provider>
    );
}
