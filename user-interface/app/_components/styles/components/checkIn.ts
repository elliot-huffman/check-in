'use client';

import { makeStyles, tokens } from '@fluentui/react-components';

/** List of CSS styles for the Check-In page components. */
export const useStyleList = makeStyles({
    'row': {
        'display': 'flex',
        'gap': '0.5rem',
        'alignItems': 'center',
        'width': '100%'
    },
    'userIDEntry': {
        'width': '70%'
    },
    'successText': {
        'color': tokens.colorStatusSuccessForeground1
    }
});
