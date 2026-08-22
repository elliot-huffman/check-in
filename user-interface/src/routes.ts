import { type RouteConfig, index, route } from '@react-router/dev/routes';

/** List of route configurations for the user interface to reference in the static HTML. */
const pageList: RouteConfig = [
    index('./pages/Home.tsx'),
    route('/About', './pages/About.tsx'),
    route('/Check-In', './pages/Check-In.tsx'),
    route('/MemberManagement', './pages/MemberManagement.tsx'),
    route('*', './pages/404.tsx')
];

// Export the page list for the react router framework to be able to build
export default pageList;
