import { makeStyles } from '@fluentui/react-components';

/** List of CSS styles for the global template component. */
export const useStyleList = makeStyles({
    'backgroundFix': {
        'minHeight': '100%'
    },
    'pageContent': {
        'overflow': 'auto',
        'paddingLeft': '2.5em',
        'width': '100%'
    }
});
