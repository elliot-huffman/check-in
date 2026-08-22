import { makeStyles, tokens } from '@fluentui/react-components';

/** List of CSS styles for the global layout component. */
export const useStyleList = makeStyles({
    'body': {
        'margin': 0
    },
    'themeProvider': {
        'minHeight': '100vh'
    },
    'html': {
        'backgroundColor': tokens.colorNeutralBackground1,
        'overflow': 'hidden',
        'scrollbarGutter': 'unset'
    }
});
