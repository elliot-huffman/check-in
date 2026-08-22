import { RendererProvider, SSRProvider, createDOMRenderer } from '@fluentui/react-components';
import { HydratedRouter } from 'react-router/dom';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';

// Add SSR support for Fluent UI components.
hydrateRoot(
    document,
    <StrictMode>
        <RendererProvider renderer={ createDOMRenderer() }>
            <SSRProvider>
                <HydratedRouter />
            </SSRProvider>
        </RendererProvider>
    </StrictMode>
);
