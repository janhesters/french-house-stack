import 'dotenv/config';
import '@testing-library/jest-dom/extend-expect';

import { installGlobals } from '@remix-run/node';

installGlobals();

// See https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#configuring-your-testing-environment.
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
