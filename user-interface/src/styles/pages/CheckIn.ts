import { makeStyles, tokens } from '@fluentui/react-components';

/** List of CSS styles for the Check-In page components. */
export const useStyleList = makeStyles({
    'input': { 'minWidth': '21em' },
    'mainContainer': { 'height': '100%' },
    'successText': { 'color': tokens.colorStatusSuccessForeground1 },
    'title': { 'marginBottom': tokens.spacingVerticalXXL }
});
