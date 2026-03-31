'use client';

import { Layout } from './_components/LayoutSystem';
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

    // Rendered page wrapper
    return (
        <Layout className={ compiledStyles.rootContainer }>
            { props.children }
        </Layout>
    );
}
