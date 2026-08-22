import { Button, Text, Title1 } from '@fluentui/react-components';
import { Layout } from '@/components/LayoutSystem';
import { useNavigate } from 'react-router';

/**
 * Renders the 404 not found page of the application.
 * @returns Rendered 404 page for the application.
 */
export default function NotFound(): React.ReactNode {
    /** Router used to navigate to the selected page. */
    const router = useNavigate();

    // Render the home page
    return (
        <Layout align="center" justify="center">
            <Title1>Page not Found (404)</Title1>
            <br />
            <Text>Sorry, the page you are looking for does not exist.</Text>
            <Text>Use the navigation menu to find a different page or use the button below to go home.</Text>
            <br />
            <Button appearance="primary" onClick={ (): void => { router('/'); } }>Return to Home</Button>
        </Layout>
    );
}
