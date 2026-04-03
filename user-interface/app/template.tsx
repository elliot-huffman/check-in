'use client';

import { Layout, LayoutItem } from './_components/elements/LayoutSystem';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { NavigationMenu } from './_components/elements/NavigationMenu';
import { TopBar } from './_components/elements/TopBar';
import { useStyleList } from './_components/styles/globalTemplate';

/** Structure of the template component's props. */
interface TemplateProps {
    /** Page content to be rendered within the template. */
    'children'?: React.ReactNode;
}

/**
 * Container for components that should be available on all pages.
 * @param props TemplateProps containing optional children.
 * @returns A React node representing the template layout.
 */
export default function Template(props: TemplateProps): React.ReactNode {
    /** CSS Styles compiled for the root template in Next.js. */
    const compiledStyles = useStyleList();

    /** Instance of the Top Bar's HTML element, used for calculating the content container's height. */
    const topBarRef = useRef<HTMLDivElement>(null);

    /** Instance of the content container's HTML element, to inject manual styling into. */
    const contentContainerRef = useRef<HTMLDivElement>(null);

    /** Function that calculates the max height of the content container based on the Top Bar's height. */
    const calculateContentMaxHeight = useCallback(() => {
        /** Max height to set the content container to. Defaults to 100vh as a fallback. */
        let calculatedMaxHeight = '100vh';

        // Check if the ref is initialized before trying to access the element's dimensions.
        if (topBarRef.current) { calculatedMaxHeight = `calc(100vh - ${ topBarRef.current.getBoundingClientRect().bottom }px)`; }

        // Set the max height of the content container to ensure it doesn't overflow the viewport, accounting for the Top Bar's height.
        if (contentContainerRef.current) { contentContainerRef.current.style.maxHeight = calculatedMaxHeight; }
    }, []);

    // Manually inject the max height of the content container to ensure perfect scrolling behavior
    useLayoutEffect(() => { calculateContentMaxHeight(); }, [calculateContentMaxHeight]);

    // Automatically recalculate the content container's max height whenever the window is resized to maintain proper layout and scrolling behavior.
    useEffect(() => {
        // Recalculate the content container's max height whenever the window is resized.
        window.addEventListener('resize', calculateContentMaxHeight);

        // Cleanup function to remove the event listener when the component unmounts.
        return (): void => { window.removeEventListener('resize', calculateContentMaxHeight); };
    }, [calculateContentMaxHeight]);

    // Rendered page wrapper
    return (
        <Layout className={ compiledStyles.rootContainer }>
            <TopBar ref={ topBarRef } />
            <Layout direction="column" noWrap ref={ contentContainerRef }>
                <NavigationMenu />
                <LayoutItem className={ compiledStyles.pageContent } >
                    { props.children }
                </LayoutItem>
            </Layout>
        </Layout>
    );
}
