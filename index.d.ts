/** Public type exports for the xyOps API client and Job runtime helper. */
export * from './types/api';
export * from './types/job';

import { api } from './types/api';
import { job } from './types/job';

/** Default package export used by ESM when importing this CommonJS module. */
declare const sdk: {
	api: typeof api;
	job: typeof job;
};

export default sdk;
