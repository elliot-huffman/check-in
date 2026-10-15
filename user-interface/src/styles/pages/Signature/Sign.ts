import { makeStyles, tokens } from '@fluentui/react-components';

/** List of CSS styles for the signature collection page. */
export const useStyleList = makeStyles({
    'licenseText': { 'whiteSpace': 'pre-wrap' },
    'signaturePad': {
        'boxShadow': tokens.shadow8,
        'maxWidth': '100%'
    }
});
