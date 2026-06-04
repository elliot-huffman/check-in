'use client';

import { makeStyles, tokens } from '@fluentui/react-components';

/** List of CSS styles for the markdown renderer. */
export const useStyleList = makeStyles({
    'blockquote': {
        'borderLeftColor': tokens.colorNeutralStroke2,
        'borderLeftStyle': 'solid',
        'borderLeftWidth': '4px',
        'color': tokens.colorNeutralForeground3,
        'paddingLeft': tokens.spacingHorizontalM,
        'width': '100%'
    },
    'blockquoteCard': {
        'backgroundColor': tokens.colorNeutralBackground2,
        'width': '100%'
    },
    'codeBlock': {
        'margin': 0,
        'overflowX': 'auto',
        'paddingBlock': tokens.spacingVerticalM,
        'paddingInline': tokens.spacingHorizontalM,
        'whiteSpace': 'pre'
    },
    'codeBlockCard': {
        'backgroundColor': tokens.colorNeutralBackground2,
        'width': '100%'
    },
    'image': {
        'display': 'block',
        'height': 'auto',
        'maxWidth': '100%',
        'width': '100%'
    },
    'imageCard': {
        'gap': tokens.spacingVerticalS,
        'width': '100%'
    },
    'inlineCode': {
        'backgroundColor': tokens.colorNeutralBackground2,
        'borderRadius': tokens.borderRadiusSmall,
        'paddingBlock': '2px',
        'paddingInline': tokens.spacingHorizontalSNudge
    },
    'list': {
        'display': 'block',
        'margin': 0,
        'paddingLeft': tokens.spacingHorizontalXXL
    },
    'listItem': {
        'display': 'list-item',
        'marginBottom': tokens.spacingVerticalXS
    },
    'root': {
        'width': '100%'
    }
});
