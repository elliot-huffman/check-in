import { Button, Subtitle1, Text, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { Layout, LayoutItem } from '@/components/LayoutSystem';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import SignaturePad from 'signature_pad';
import { themeModeSelector } from '@/store/slices/themeProvider';
import { useSelector } from 'react-redux';
import { useStyleList } from '@/styles/pages/Signature/Sign';

/**
 * Renders a page used to collect signatures from the specified end user.
 * @returns A React node representing the page content.
 */
export default function Page(): React.ReactNode {
    /** Compiled CSS styles for the About page. */
    const compiledStyles = useStyleList();

    /** Flag that indicates which theme mode is requested. */
    const themeMode = useSelector(themeModeSelector);

    /** Reference to the canvas element used for capturing the signature. */
    const canvasInstance = useRef<HTMLCanvasElement>(null);

    /** Reference to the signature pad attached to the canvas. */
    const signaturePadInstance = useRef<SignaturePad>(void 0);

    /** Current theme used for style value extraction and dynamic theming purposes for the canvas element since it doesn't support CSS vars. */
    const selectedTheme = useMemo(() => {
        // If a dark theme is requested, return the dark fluent theme
        if (themeMode === 'dark') { return webDarkTheme; }

        // Default to a light theme for all other modes
        return webLightTheme;
    }, [themeMode]);

    /** Updates the DPI settings of the signature pad to ensure proper rendering on high-DPI displays. */
    const updateSigPadDpi = useCallback(() => {
        // Only update the DPI if both the signature pad and the canvas instance are available.
        if (signaturePadInstance.current && canvasInstance.current) {
            /** Calculated device pixel ratio for high-DPI displays. */
            const ratio = Math.max(window.devicePixelRatio || 1, 1);

            // Update the width to match the scaled device pixel ratio
            canvasInstance.current.width = canvasInstance.current.offsetWidth * ratio;

            // Update the height to match the scaled device pixel ratio
            canvasInstance.current.height = canvasInstance.current.offsetHeight * ratio;

            // Scale the canvas context to account for the device pixel ratio
            canvasInstance.current.getContext('2d')!.scale(ratio, ratio);

            // Clear the signature pad as unmanaged content may be present that is not accounted for by all the sig pad APIs
            signaturePadInstance.current.clear();
        }
    }, []);

    /** Initializes the signature pad after the canvas has been attached to the DOM. */
    useEffect(() => {
        // Initialize the signature pad only if the canvas element is available.
        if (canvasInstance.current) {
            /** Signature pad command and control object. */
            const signaturePad = new SignaturePad(canvasInstance.current, {
                'backgroundColor': selectedTheme.colorBrandBackground2,
                'penColor': selectedTheme.colorNeutralForeground1
            });

            // Store the signature pad instance in the ref for later use.
            signaturePadInstance.current = signaturePad;
        }

        // Remove the signature pad
        return (): void => {
            // Disable the input on the signature pad before cleanup.
            signaturePadInstance.current?.off();

            // Clear the reference to the signature pad instance.
            signaturePadInstance.current = void 0;
        };
    }, [selectedTheme, updateSigPadDpi]);

    // Automatically update the signature pad's DPI whenever the window is resized to ensure proper rendering on high-DPI displays.
    useEffect(() => {
        // Update the DPI of the signature pad whenever the window is resized.
        window.addEventListener('resize', updateSigPadDpi);

        // Update the DPI settings of the signature pad to ensure proper rendering on high-DPI displays.
        updateSigPadDpi();

        // Cleanup function to remove the event listener when the component unmounts.
        return (): void => { window.removeEventListener('resize', updateSigPadDpi); };
    }, [updateSigPadDpi]);

    // Renders the page content
    return (
        <Layout>
            <Subtitle1>Signing User: Elliot Huffman</Subtitle1>
            <Text className={ compiledStyles.licenseText }>Legal agreement here...</Text>
            <canvas className={ compiledStyles.signaturePad } ref={ canvasInstance } />
            <LayoutItem justify="end"><Button appearance="subtle" onClick={ (): void => { signaturePadInstance.current?.clear(); } }>Clear</Button></LayoutItem>
        </Layout>
    );
}
