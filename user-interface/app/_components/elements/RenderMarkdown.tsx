'use client';

import { Body1, Body1Strong, Caption1, Card, CardPreview, Divider, Image, Link, ListItem, Subtitle1, Subtitle2, Title1, Title2, Title3 } from '@fluentui/react-components';
import { Layout, LayoutItem } from './LayoutSystem';
import markdownItFactory from 'markdown-it';
import { Fragment, useMemo } from 'react';
import type { MarkdownItInstanceFactory, MarkdownToken } from '../types/RenderMarkdown';
import { useStyleList } from '../styles/elements/RenderMarkdown';

/** Props accepted by the RenderMarkdown component. */
interface RenderMarkdownProps {
    /** Raw markdown source that will be parsed and rendered. */
    'content': string;
}

/** Shared markdown-it instance configured for safe token parsing. */
const markdownIt = (markdownItFactory as unknown as MarkdownItInstanceFactory)('commonmark', {
    // Disable raw HTML parsing so markdown content stays safe.
    'html': false,
    // Disable typographic substitutions so the source text stays predictable.
    'typographer': false
});

/**
 * Renders safe markdown content using Fluent UI typography and link components.
 * @param props Markdown content to render.
 * @returns Rendered markdown tree.
 */
export function RenderMarkdown(props: RenderMarkdownProps): React.ReactNode {
    /** Griffel class names used by the markdown renderer. */
    const styleList = useStyleList();

    /** Parsed markdown token stream derived from the input content. */
    const parsedTokens = useMemo(() => markdownIt.parse(props.content, {}), [props.content]);

    /** Memoized React node tree produced from the parsed markdown tokens. */
    const renderedNodes = useMemo(() => {
        /**
         * Determines whether a URI is safe to render as a link or image source.
         * @param rawUri Candidate URI extracted from markdown tokens.
         * @returns True when the URI is safe to render.
         */
        function isSafeUri(rawUri: string | null): rawUri is string {
            // Reject missing URIs immediately.
            if (rawUri === null) { return false; }

            /** Candidate URI with surrounding whitespace removed. */
            const trimmedUri = rawUri.trim();

            // Reject empty URIs after trimming.
            if (trimmedUri.length === 0) { return false; }

            // Allow safe relative or local navigation targets.
            if (
                trimmedUri.startsWith('#')
                || trimmedUri.startsWith('?')
                || trimmedUri.startsWith('./')
                || trimmedUri.startsWith('../')
                || (trimmedUri.startsWith('/') && !trimmedUri.startsWith('//'))
            ) {
                // Mark safe local URIs as allowed.
                return true;
            }

            try {
                /** Structured URL parsed from the candidate URI string. */
                const parsedUri = new URL(trimmedUri);

                // Allow secure HTTPS links, email links, and telephone links.
                return parsedUri.protocol === 'https:'
                    || parsedUri.protocol === 'mailto:'
                    || parsedUri.protocol === 'tel:';
            } catch {
                // Reject values that cannot be parsed safely.
                return false;
            }
        }

        /**
         * Determines whether a safe URI targets an external destination.
         * @param uri Safe URI to classify.
         * @returns True when the URI should be treated as external.
         */
        function isExternalUri(uri: string): boolean {
            // Treat secure absolute URLs as external destinations.
            return uri.startsWith('https://');
        }

        /**
         * Flattens nested markdown tokens into a readable plain-text string.
         * @param tokens Child tokens to flatten.
         * @returns Plain-text content derived from the token list.
         */
        function collectPlainText(tokens: MarkdownToken[] | null): string {
            // Return an empty string when there are no child tokens.
            if (tokens === null) { return ''; }

            /** Accumulates the flattened plain-text output for the current token list. */
            let result = '';

            // Visit each token in order to collect readable text.
            for (const token of tokens) {
                // Handle each token according to its markdown meaning.
                switch (token.type) {
                    case 'code_inline':
                    case 'html_inline':
                    case 'text':
                        // Append direct text-like content to the result.
                        result += token.content;

                        break;
                    case 'hardbreak':
                    case 'softbreak':
                        // Replace line breaks with spaces in flattened text.
                        result += ' ';

                        break;
                    default:
                        // Recurse into child tokens to gather nested text.
                        result += collectPlainText(token.children);

                        break;
                }
            }

            // Return the accumulated plain-text value.
            return result;
        }

        /**
         * Maps a markdown heading level to the matching Fluent typography component.
         * @param level Heading depth parsed from the markdown token.
         * @param children Rendered heading children.
         * @param key Stable React key for the heading node.
         * @returns A Fluent typography node representing the heading.
         */
        function renderHeading(level: number, children: React.ReactNode[], key: string): React.ReactNode {
            // Select the appropriate typography component for the heading depth.
            switch (level) {
                case 1:
                    return <Title1 key={ key }>{ children }</Title1>;
                case 2:
                    return <Title2 key={ key }>{ children }</Title2>;
                case 3:
                    return <Title3 key={ key }>{ children }</Title3>;
                case 4:
                    return <Subtitle1 key={ key }>{ children }</Subtitle1>;
                default:
                    return <Subtitle2 key={ key }>{ children }</Subtitle2>;
            }
        }

        /**
         * Renders a contiguous inline token range into React nodes.
         * @param tokensToRender Inline tokens to render.
         * @param keyPrefix Prefix used to build stable React keys.
         * @param startIndex Starting token index within the provided token list.
         * @param closingTokenType Optional closing token that terminates the range.
         * @returns The rendered nodes and the next unread token index.
         */
        function renderInlineRange(tokensToRender: MarkdownToken[] | null, keyPrefix: string, startIndex: number, closingTokenType: string | null = null): { 'nextIndex': number; 'nodes': React.ReactNode[]; } {
            // Return an empty result when no inline tokens exist.
            if (tokensToRender === null) {
                return {
                    'nextIndex': startIndex,
                    'nodes': []
                };
            }

            /** Rendered nodes accumulated for this inline token range. */
            const nodes: React.ReactNode[] = [];

            /** Current traversal position within the inline token range. */
            let index = startIndex;

            // Continue until the inline token range is exhausted.
            while (index < tokensToRender.length) {
                /** Current inline token being rendered. */
                const token = tokensToRender[index]!;

                // Stop when the matching closing token is reached.
                if (closingTokenType !== null && token.type === closingTokenType) {
                    return {
                        'nextIndex': index,
                        nodes
                    };
                }

                /** Stable React key for the current inline token render. */
                const key = `${ keyPrefix }-${ index }`;

                /** Next inline token index after the current token finishes rendering. */
                let nextIndex = index + 1;

                // Branch based on the inline token type.
                switch (token.type) {
                    case 'code_inline':
                        nodes.push(<code className={ styleList.inlineCode } key={ key }><Caption1>{ token.content }</Caption1></code>);

                        break;
                    case 'em_open': {
                        /** Rendered inline children enclosed by the emphasis token pair. */
                        const renderedContent = renderInlineRange(tokensToRender, `${ key }-emphasis`, index + 1, 'em_close');

                        nodes.push(<em key={ key }>{ renderedContent.nodes }</em>);

                        nextIndex = renderedContent.nextIndex + 1;

                        break;
                    }
                    case 'hardbreak':
                        nodes.push(<br key={ key } />);

                        break;
                    case 'softbreak':
                        nodes.push('\n');

                        break;
                    case 'html_inline':
                    case 'text':
                        nodes.push(token.content);

                        break;
                    case 'image': {
                        /** Accessible text derived for the current markdown image token. */
                        const altText = collectPlainText(token.children).trim() || token.content || 'Image';

                        /** Candidate source URI extracted from the current markdown image token. */
                        const sourceUri = token.attrGet('src');

                        if (!isSafeUri(sourceUri)) {
                            nodes.push(<Caption1 key={ key }>{ altText }</Caption1>);
                        } else {
                            nodes.push(
                                <Card className={ styleList.imageCard } key={ key }>
                                    <CardPreview>
                                        <Image alt={ altText } className={ styleList.image } src={ sourceUri } />
                                    </CardPreview>
                                    <Caption1>
                                        {
                                            isExternalUri(sourceUri)
                                                ? <Link href={ sourceUri } rel="noreferrer noopener nofollow" target="_blank">{ altText }</Link>
                                                : <Link href={ sourceUri }>{ altText }</Link>
                                        }
                                    </Caption1>
                                </Card>
                            );
                        }

                        break;
                    }
                    case 'link_open': {
                        /** Rendered inline children enclosed by the current link token pair. */
                        const renderedContent = renderInlineRange(tokensToRender, `${ key }-link`, index + 1, 'link_close');

                        /** Candidate destination URI extracted from the current markdown link token. */
                        const href = token.attrGet('href');

                        if (!isSafeUri(href)) {
                            nodes.push(<Fragment key={ key }>{ renderedContent.nodes }</Fragment>);
                        } else {
                            nodes.push(
                                isExternalUri(href)
                                    ? <Link href={ href } key={ key } rel="noreferrer noopener nofollow" target="_blank">{ renderedContent.nodes }</Link>
                                    : <Link href={ href } key={ key }>{ renderedContent.nodes }</Link>
                            );
                        }

                        nextIndex = renderedContent.nextIndex + 1;

                        break;
                    }
                    case 's_open': {
                        /** Rendered inline children enclosed by the strikethrough token pair. */
                        const renderedContent = renderInlineRange(tokensToRender, `${ key }-strikethrough`, index + 1, 's_close');

                        nodes.push(<s key={ key }>{ renderedContent.nodes }</s>);

                        nextIndex = renderedContent.nextIndex + 1;

                        break;
                    }
                    case 'strong_open': {
                        /** Rendered inline children enclosed by the strong emphasis token pair. */
                        const renderedContent = renderInlineRange(tokensToRender, `${ key }-strong`, index + 1, 'strong_close');

                        nodes.push(<Body1Strong key={ key }>{ renderedContent.nodes }</Body1Strong>);

                        nextIndex = renderedContent.nextIndex + 1;

                        break;
                    }
                    default:
                        if (token.children !== null) { nodes.push(<Fragment key={ key }>{ renderInlineRange(token.children, `${ key }-children`, 0).nodes }</Fragment>); }

                        break;
                }

                index = nextIndex;
            }

            // Return the fully rendered inline result when the loop finishes normally.
            return {
                'nextIndex': index,
                'nodes': nodes
            };
        }

        /**
         * Renders a contiguous block token range into React nodes.
         * @param tokensToRender Block tokens to render.
         * @param keyPrefix Prefix used to build stable React keys.
         * @param startIndex Starting token index within the provided token list.
         * @param closingTokenType Optional closing token that terminates the range.
         * @returns The rendered nodes and the next unread token index.
         */
        function renderBlockRange(tokensToRender: MarkdownToken[], keyPrefix: string, startIndex: number, closingTokenType: string | null = null): { 'nextIndex': number; 'nodes': React.ReactNode[]; } {
            /** Rendered nodes accumulated for this block token range. */
            const nodes: React.ReactNode[] = [];

            /** Current traversal position within the block token range. */
            let index = startIndex;

            /**
             * Renders list body tokens into list item nodes.
             * @param listTokens Tokens contained within the current list block.
             * @param startIndex Starting token index for the list body range, immediately after the list opening token.
             * @param listKeyPrefix Prefix used to build stable list item keys.
             * @param listClosingTokenType Token type that marks the end of the list body.
             * @returns The rendered list items and the next unread token index.
             */
            function renderListItems(listTokens: MarkdownToken[], startIndex: number, listKeyPrefix: string, listClosingTokenType: string): { 'nextIndex': number; 'nodes': React.ReactNode[]; } {
                /** Rendered list item nodes accumulated for the current list body. */
                const listNodes: React.ReactNode[] = [];

                /** Current traversal position within the list token range. */
                let listIndex = startIndex;

                /** Zero-based index of the current list item being rendered. */
                let itemIndex = 0;

                // Continue until the list body token range is exhausted.
                while (listIndex < listTokens.length) {
                    /** Current token being processed within the list body. */
                    const token = listTokens[listIndex]!;

                    // Stop when the list-closing token is reached.
                    if (token.type === listClosingTokenType) {
                        return {
                            'nextIndex': listIndex,
                            'nodes': listNodes
                        };
                    }

                    // Render the content inside each list item.
                    if (token.type === 'list_item_open') {
                        /** Rendered block nodes contained within the current list item. */
                        const renderedContent = renderBlockRange(listTokens, `${ listKeyPrefix }-item-${ itemIndex }`, listIndex + 1, 'list_item_close');

                        listNodes.push(<ListItem
                            className={ styleList.listItem }
                            key={ `${ listKeyPrefix }-${ itemIndex }` }
                            style={ {
                                'display': 'list-item',
                                'listStyleType': 'inherit'
                            } }>
                            { renderedContent.nodes }
                        </ListItem>);

                        itemIndex += 1;

                        listIndex = renderedContent.nextIndex + 1;
                    } else {
                        // Skip tokens that do not start a list item.
                        listIndex += 1;
                    }
                }

                // Return the rendered list body when the loop finishes normally.
                return {
                    'nextIndex': listIndex,
                    'nodes': listNodes
                };
            }

            // Continue until the block token range is exhausted.
            while (index < tokensToRender.length) {
                /** Current block token being rendered. */
                const token = tokensToRender[index]!;

                // Stop when the matching closing token is reached.
                if (closingTokenType !== null && token.type === closingTokenType) {
                    return {
                        'nextIndex': index,
                        nodes
                    };
                }

                /** Stable React key for the current block token render. */
                const key = `${ keyPrefix }-${ index }`;

                /** Next block token index after the current token finishes rendering. */
                let nextIndex = index + 1;

                // Branch based on the block token type.
                switch (token.type) {
                    case 'blockquote_open': {
                        /** Rendered block nodes enclosed by the current blockquote token pair. */
                        const renderedContent = renderBlockRange(tokensToRender, `${ key }-blockquote`, index + 1, 'blockquote_close');

                        nodes.push(
                            <Card className={ styleList.blockquoteCard } key={ key }>
                                <CardPreview>
                                    <Layout className={ styleList.blockquote } direction="column" gap="small">
                                        { renderedContent.nodes }
                                    </Layout>
                                </CardPreview>
                            </Card>
                        );

                        nextIndex = renderedContent.nextIndex + 1;

                        break;
                    }
                    case 'bullet_list_open': {
                        /** Rendered list items contained within the current unordered list. */
                        const renderedContent = renderListItems(tokensToRender, index + 1, `${ key }-bullet-list`, 'bullet_list_close');

                        nodes.push(<ul className={ styleList.list } key={ key }>{ renderedContent.nodes }</ul>);

                        nextIndex = renderedContent.nextIndex + 1;

                        break;
                    }
                    case 'code_block':
                    case 'fence':
                        nodes.push(
                            <Card className={ styleList.codeBlockCard } key={ key }>
                                <CardPreview>
                                    <pre className={ styleList.codeBlock }><code>{ token.content }</code></pre>
                                </CardPreview>
                            </Card>
                        );

                        break;
                    case 'heading_open': {
                        /** Numeric heading depth parsed from the current heading tag. */
                        const headingLevel = Number.parseInt(token.tag.slice(1), 10);

                        /** Inline content token associated with the current heading block. */
                        const headingContent = tokensToRender[index + 1];

                        /** Rendered inline nodes for the current heading content. */
                        const children = headingContent?.type === 'inline' ? renderInlineRange(headingContent.children, `${ key }-heading`, 0).nodes : [];

                        nodes.push(renderHeading(Number.isNaN(headingLevel) ? 6 : headingLevel, children, key));

                        nextIndex = index + 3;

                        break;
                    }
                    case 'hr':
                        nodes.push(<Divider key={ key } />);

                        break;
                    case 'inline':
                        nodes.push(<Body1 key={ key }>{ renderInlineRange(token.children, `${ key }-inline`, 0).nodes }</Body1>);

                        break;
                    case 'ordered_list_open': {
                        /** Raw starting index attribute value for the current ordered list token. */
                        const startValue = token.attrGet('start');

                        /** Parsed numeric starting index for the current ordered list, when provided. */
                        const parsedStartValue = startValue === null ? Number.NaN : Number.parseInt(startValue, 10);

                        /** Rendered list items contained within the current ordered list. */
                        const renderedContent = renderListItems(tokensToRender, index + 1, `${ key }-ordered-list`, 'ordered_list_close');

                        nodes.push(
                            Number.isNaN(parsedStartValue)
                                ? <ol className={ styleList.list } key={ key }>{ renderedContent.nodes }</ol>
                                : <ol className={ styleList.list } key={ key } start={ parsedStartValue }>{ renderedContent.nodes }</ol>
                        );

                        nextIndex = renderedContent.nextIndex + 1;

                        break;
                    }
                    case 'paragraph_open': {
                        /** Inline content token associated with the current paragraph block. */
                        const paragraphContent = tokensToRender[index + 1];

                        /** Rendered inline nodes for the current paragraph content. */
                        const children = paragraphContent?.type === 'inline' ? renderInlineRange(paragraphContent.children, `${ key }-paragraph`, 0).nodes : [];

                        nodes.push(token.hidden ? <Fragment key={ key }>{ children }</Fragment> : <Body1 key={ key }>{ children }</Body1>);

                        nextIndex = index + 3;

                        break;
                    }
                    default:
                        if (token.children !== null) { nodes.push(<Fragment key={ key }>{ renderInlineRange(token.children, `${ key }-children`, 0).nodes }</Fragment>); }

                        break;
                }

                index = nextIndex;
            }

            // Return the fully rendered block result when the loop finishes normally.
            return {
                'nextIndex': index,
                nodes
            };
        }

        // Render the parsed markdown token stream into a React node list.
        return renderBlockRange(parsedTokens, 'markdown-root', 0).nodes;
    }, [parsedTokens, styleList]);

    // Return the final layout-based markdown output.
    return (
        // Render the root markdown container using the shared layout system.
        <Layout className={ styleList.root } direction="column" gap="medium">
            {/* Render the memoized markdown nodes inside a layout item wrapper. */ }
            <LayoutItem>{ renderedNodes }</LayoutItem>
        </Layout>
    );
}
