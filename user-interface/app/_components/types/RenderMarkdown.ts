'use client';

/** Options passed to the markdown-it parser factory. */
export interface MarkdownItOptions {
    /** Disables raw HTML parsing in markdown content. */
    'html': boolean;
    /** Disables typographic quote and dash substitutions. */
    'typographer': boolean;
}

/** Minimal parser surface required by the markdown renderer. */
export interface MarkdownItInstance {
    /** Parses markdown into a flat token stream. */
    'parse': (content: string, env: Record<string, never>) => MarkdownToken[];
}

/** Callable factory shape used to construct a markdown-it instance. */
export type MarkdownItPreset = 'commonmark' | 'default' | 'zero';

/** Callable factory shape used to construct a markdown-it instance. */
export interface MarkdownItInstanceFactory {
    (presetName: MarkdownItPreset, options: MarkdownItOptions): MarkdownItInstance;
    (options: MarkdownItOptions): MarkdownItInstance;
}

/** Single parsed markdown token emitted by markdown-it. */
export interface MarkdownToken {
    /** Token type identifier emitted by markdown-it. */
    'type': string;
    /** HTML tag associated with the token. */
    'tag': string;
    /** Child tokens attached to inline and image nodes. */
    'children': MarkdownToken[] | null;
    /** Raw textual content carried by the token. */
    'content': string;
    /** Indicates whether the token should be hidden when rendered. */
    'hidden': boolean;
    /** Returns an attribute value when present on the token. */
    'attrGet': (name: string) => string | null;
}
