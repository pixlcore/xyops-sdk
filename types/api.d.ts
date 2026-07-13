import type {
	JobAction,
	JobActionCondition,
	JobData,
	JobDataMap,
	JobField,
	JobLimit,
	JobParams
} from './job';

/** An error returned by the SDK without throwing. */
export type APIError = Error | string;

/** Freeform request properties accepted by the low-level API client. */
export interface APIRequestData {
	[key: string]: unknown;
}

/** HTTP headers accepted by pixl-request. */
export interface APIRequestHeaders {
	[name: string]: string | number | readonly string[] | undefined;
}

/** File path accepted by the SDK's multipart upload shorthand. */
export type APIUploadFile = string | readonly [path: string, filename: string];

/** Per-request options forwarded to pixl-request. */
export interface APIRequestOptions {
	headers?: APIRequestHeaders;
	files?: readonly APIUploadFile[] | Record<string, APIUploadFile>;
	download?: unknown;
	iterator?: (data: unknown) => void;
	[key: string]: unknown;
}

/** Options object or shorthand file array accepted by upload methods. */
export type APIUploadOptions = APIRequestOptions | readonly APIUploadFile[];

/** A shorthand upload list containing at least one file. */
export type APINonEmptyUploadFiles = readonly [APIUploadFile, ...APIUploadFile[]];

/** Options for an endpoint which requires one or more uploaded files. */
export type APIRequiredUploadOptions =
	| APINonEmptyUploadFiles
	| (Omit<APIRequestOptions, 'files'> & {
		files: APINonEmptyUploadFiles | Record<string, APIUploadFile>;
	});

/** Options for an endpoint which requires exactly one `file1` upload. */
export type APISingleUploadOptions =
	| readonly [APIUploadFile]
	| (Omit<APIRequestOptions, 'files'> & {
		files: readonly [APIUploadFile] | { file1: APIUploadFile };
	});

/** Raw HTTP response information exposed by pixl-request. */
export interface APIHTTPResponse {
	statusCode?: number;
	statusMessage?: string;
	headers: Record<string, string | string[] | undefined>;
	[key: string]: unknown;
}

/** Summary returned by the pixl-perf request tracker. */
export interface APIPerformanceMetrics {
	scale: number;
	perf: Record<string, number>;
	counters: Record<string, number>;
	[key: string]: unknown;
}

/** pixl-perf tracker included with an API response. */
export interface APIPerformanceTracker {
	metrics(): APIPerformanceMetrics;
	[key: string]: unknown;
}

/** Properties included in every JSON response from xyOps. */
export interface APIResponseData {
	/** Zero indicates success. Other numeric or string values indicate errors. */
	code: number | string;
	/** Error description included when code is not zero. */
	description?: string;
	[key: string]: unknown;
}

/** The response wrapper returned by SDK API methods. */
export interface APIResponse<T extends APIResponseData = APIResponseData> {
	/** Error object or message. Check this before using data. */
	err?: APIError;
	/** Parsed JSON response body. */
	data: T;
	/** Raw Node.js HTTP response. */
	resp?: APIHTTPResponse;
	/** Request performance tracker. */
	perf?: APIPerformanceTracker;
	[key: string]: unknown;
}

/** Response wrapper for binary downloads and streaming endpoints. */
export interface APIRawResponse<T = unknown> {
	err?: APIError;
	data?: T;
	resp?: APIHTTPResponse;
	perf?: APIPerformanceTracker;
	[key: string]: unknown;
}

/** Request options requiring a binary download destination or writable stream. */
export type APIDownloadOptions = Omit<APIRequestOptions, 'download'> & {
	download: unknown;
};

/** List metadata returned alongside rows from list APIs. */
export interface APIList {
	length: number;
	offset?: number;
	limit?: number;
	[key: string]: unknown;
}

/** Action attached to an alert, category, group, event, or job. */
export type Action = JobAction;

/** Resource limit attached to a category, event, or job. */
export type Limit = JobLimit;

//
// Alerts
//

/** A stored xyOps alert definition. */
export interface Alert {
	id: string;
	title: string;
	enabled: boolean;
	icon?: string;
	expression: string;
	message: string;
	groups: string[];
	actions: Action[];
	monitor_id?: string;
	samples: number;
	exclusive_actions?: boolean;
	/** Prevent new jobs from starting on a server while the alert is active. */
	limit_jobs?: boolean;
	/** Abort running jobs on a server when the alert fires. */
	abort_jobs?: boolean;
	notes?: string;
	username: string;
	modified: number;
	created: number;
	revision: number;
	/** Legacy direct email field retained for older alert definitions. */
	email?: string;
	/** Legacy direct web hook field retained for older alert definitions. */
	web_hook?: string;
	[key: string]: unknown;
}

/** Properties accepted when creating an alert. */
export interface CreateAlertRequest {
	/** Optional custom ID. xyOps generates one when omitted. */
	id?: string;
	title: string;
	expression: string;
	message: string;
	enabled?: boolean;
	icon?: string;
	groups?: string[];
	actions?: Action[];
	monitor_id?: string;
	samples?: number;
	exclusive_actions?: boolean;
	limit_jobs?: boolean;
	abort_jobs?: boolean;
	notes?: string;
	/** Legacy direct email field retained for older xyOps installations. */
	email?: string;
	/** Legacy direct web hook field retained for older xyOps installations. */
	web_hook?: string;
}

/** Properties accepted when updating an alert. Only id is required. */
export interface UpdateAlertRequest extends Partial<CreateAlertRequest> {
	id: string;
}

/** Request used to fetch or delete one alert. */
export interface AlertIDRequest {
	id: string;
}

/** Request used to test an alert against current server data. */
export interface TestAlertRequest {
	server: string;
	expression: string;
	message: string;
}

/** Fetch several historical Alert invocations in request order. */
export interface GetAlertInvocationsRequest {
	ids: readonly [string, ...string[]];
}

/** Per-item failure returned while loading several Alert invocations. */
export interface AlertInvocationLookupError {
	err: APIError | APIRequestData;
	id?: never;
}

/** Replace all Ticket associations on one historical Alert invocation. */
export interface ManageAlertInvocationTicketsRequest {
	id: string;
	tickets: string[];
}

/** Request used to delete one historical Alert invocation. */
export interface AlertInvocationIDRequest {
	id: string;
}

export interface GetAlertsResponse extends APIResponseData {
	rows: Alert[];
	list: APIList;
}

export interface GetAlertResponse extends APIResponseData {
	alert: Alert;
}

export interface CreateAlertResponse extends APIResponseData {
	alert: Alert;
}

export interface TestAlertResponse extends APIResponseData {
	result: boolean;
	message: string;
}

export interface GetAlertInvocationsResponse extends APIResponseData {
	alerts: Array<AlertInvocation | AlertInvocationLookupError>;
}

//
// Buckets
//

/** Arbitrary user-defined JSON data stored in a bucket. */
export interface BucketData {
	[key: string]: unknown;
}

/** Metadata for a file stored by xyOps. */
export interface File {
	id: string;
	path: string;
	filename: string;
	size: number;
	date: number;
	job?: string;
	server?: string;
	ticket?: string;
	username?: string;
	[key: string]: unknown;
}

/** A stored xyOps bucket definition. Data and files are stored separately. */
export interface Bucket {
	id: string;
	title: string;
	enabled: boolean;
	icon?: string;
	notes?: string;
	username: string;
	modified: number;
	created: number;
	revision: number;
	/** Present on composite bucket objects and some exports. */
	data?: BucketData;
	/** Present on composite bucket objects and some exports. */
	files?: File[];
	[key: string]: unknown;
}

/** Properties accepted when creating a bucket. */
export interface CreateBucketRequest {
	/** Optional custom ID. xyOps generates one when omitted. */
	id?: string;
	title: string;
	enabled?: boolean;
	icon?: string;
	notes?: string;
	/** Optional initial user-defined data. */
	data?: BucketData;
}

/** Properties accepted when updating a bucket. Only id is required. */
export interface UpdateBucketRequest extends Partial<CreateBucketRequest> {
	id: string;
}

/** Request used to fetch, delete, or upload files to one bucket. */
export interface BucketIDRequest {
	id: string;
}

/** Shallow-merges user-defined data into a bucket. */
export interface WriteBucketDataRequest extends BucketIDRequest {
	data: BucketData;
	/** Return the complete merged data object in the response. */
	fetch?: boolean;
}

/** Deletes one bucket file using its normalized filename. */
export interface DeleteBucketFileRequest extends BucketIDRequest {
	filename: string;
}

/**
 * Empties bucket files, bucket data, or both. At least one selection must be
 * true or xyOps rejects the request.
 */
export type EmptyBucketRequest =
	| { id: string; files: true; data?: boolean }
	| { id: string; files?: boolean; data: true };

export interface GetBucketsResponse extends APIResponseData {
	rows: Bucket[];
	list: APIList;
}

export interface GetBucketResponse extends APIResponseData {
	bucket: Bucket;
	data: BucketData;
	files: File[];
}

export interface CreateBucketResponse extends APIResponseData {
	bucket: Bucket;
}

export interface WriteBucketDataResponse extends APIResponseData {
	/** Complete merged data when fetch is true, otherwise null. */
	data: BucketData | null;
}

export interface UploadBucketFilesResponse extends APIResponseData {
	/** Complete updated file list for the bucket. */
	files: File[];
}

//
// Categories
//

/** Visual colors supported by category labels. */
export type CategoryColor =
	| 'plain'
	| 'red'
	| 'fire'
	| 'orange'
	| 'tangerine'
	| 'amber'
	| 'gold'
	| 'yellow'
	| 'lemon'
	| 'lime'
	| 'grass'
	| 'green'
	| 'mint'
	| 'emerald'
	| 'aqua'
	| 'teal'
	| 'turquoise'
	| 'cyan'
	| 'ice'
	| 'skyblue'
	| 'azure'
	| 'blue'
	| 'sapphire'
	| 'indigo'
	| 'lavender'
	| 'violet'
	| 'orchid'
	| 'purple'
	| 'magenta'
	| 'fuchsia'
	| 'hotpink'
	| 'pink'
	| 'blush'
	| 'rose';

/** A stored xyOps event category. */
export interface Category {
	id: string;
	title: string;
	enabled: boolean;
	icon?: string;
	color: CategoryColor;
	notes?: string;
	username: string;
	modified: number;
	created: number;
	revision: number;
	sort_order: number;
	actions: Action[];
	limits: Limit[];
	[key: string]: unknown;
}

/** Properties accepted when creating a category. */
export interface CreateCategoryRequest {
	/** Optional custom ID. xyOps generates one when omitted. */
	id?: string;
	title: string;
	enabled?: boolean;
	icon?: string;
	color?: CategoryColor;
	notes?: string;
	actions?: Action[];
	limits?: Limit[];
}

/** Properties accepted when updating a category. Only id is required. */
export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
	id: string;
}

/** Request used to fetch or delete one category. */
export interface CategoryIDRequest {
	id: string;
}

/** One category order update in a multi-update request. */
export interface CategorySortOrderUpdate {
	id: string;
	sort_order: number;
}

/** Reorders multiple categories in one request. */
export interface MultiUpdateCategoryRequest {
	items: CategorySortOrderUpdate[];
}

export interface GetCategoriesResponse extends APIResponseData {
	rows: Category[];
	list: APIList;
}

export interface GetCategoryResponse extends APIResponseData {
	category: Category;
}

export interface CreateCategoryResponse extends APIResponseData {
	category: Category;
}

//
// Channels
//

/** A stored xyOps notification channel. */
export interface Channel {
	id: string;
	title: string;
	enabled: boolean;
	icon?: string;
	users: string[];
	email: string;
	web_hook: string;
	run_event: string;
	sound: string;
	max_per_day: number;
	notes: string;
	username: string;
	modified: number;
	created: number;
	revision: number;
	[key: string]: unknown;
}

/** Properties accepted when creating a notification channel. */
export interface CreateChannelRequest {
	/** Optional custom ID. xyOps generates one when omitted. */
	id?: string;
	title: string;
	enabled?: boolean;
	icon?: string;
	users?: string[];
	email?: string;
	web_hook?: string;
	run_event?: string;
	sound?: string;
	max_per_day?: number;
	notes?: string;
}

/** Properties accepted when updating a channel. Only id is required. */
export interface UpdateChannelRequest extends Partial<CreateChannelRequest> {
	id: string;
}

/** Request used to fetch or delete one channel. */
export interface ChannelIDRequest {
	id: string;
}

export interface GetChannelsResponse extends APIResponseData {
	rows: Channel[];
	list: APIList;
}

export interface GetChannelResponse extends APIResponseData {
	channel: Channel;
}

export interface CreateChannelResponse extends APIResponseData {
	channel: Channel;
}

//
// Events
//

/** Server-selection algorithms documented by xyOps. */
export type EventAlgorithm =
	| 'random'
	| 'round_robin'
	| 'least_cpu'
	| 'least_mem'
	| 'fewest_jobs'
	| 'prefer_first_natural'
	| 'prefer_last_natural'
	| 'prefer_first'
	| 'prefer_last'
	| `monitor:${string}`;

/** All persisted trigger types accepted by the Event API. */
export type TriggerType =
	| 'manual'
	| 'schedule'
	| 'interval'
	| 'single'
	| 'magic'
	| 'keyboard'
	| 'startup'
	| 'catchup'
	| 'nth'
	| 'range'
	| 'blackout'
	| 'delay'
	| 'precision'
	| 'quiet'
	| 'plugin';

/** Properties shared by all Event triggers. */
export interface TriggerBase {
	type: TriggerType;
	enabled: boolean;
	/** Event field values to merge into the launched job parameters. */
	params?: JobParams;
	[key: string]: unknown;
}

export interface ManualTrigger extends TriggerBase {
	type: 'manual';
}

export interface ScheduleTrigger extends TriggerBase {
	type: 'schedule';
	years?: number[];
	months?: number[];
	days?: number[];
	weekdays?: number[];
	hours?: number[];
	minutes?: number[];
	timezone?: string;
}

export interface IntervalTrigger extends TriggerBase {
	type: 'interval';
	start: number;
	duration: number;
}

export interface SingleTrigger extends TriggerBase {
	type: 'single';
	epoch: number;
}

export interface MagicTrigger extends TriggerBase {
	type: 'magic';
	/** Plain token accepted on create or update and replaced by token. */
	key?: string;
	/** SHA-256 token hash stored by xyOps. */
	token?: string;
}

export interface KeyboardTrigger extends TriggerBase {
	type: 'keyboard';
	keys: string[];
}

export interface StartupTrigger extends TriggerBase {
	type: 'startup';
}

export interface CatchupTrigger extends TriggerBase {
	type: 'catchup';
}

export interface NthTrigger extends TriggerBase {
	type: 'nth';
	/** Run every Nth scheduled job. Must be at least 2. */
	every: number;
}

export interface RangeTrigger extends TriggerBase {
	type: 'range';
	start?: number;
	end?: number;
}

export interface BlackoutTrigger extends TriggerBase {
	type: 'blackout';
	start: number;
	end: number;
}

export interface DelayTrigger extends TriggerBase {
	type: 'delay';
	duration: number;
}

export interface PrecisionTrigger extends TriggerBase {
	type: 'precision';
	seconds: number[];
}

/** Quiet triggers require invisible mode, ephemeral mode, or both. */
export type QuietTrigger = TriggerBase & {
	type: 'quiet';
} & (
	| { invisible: true; ephemeral?: boolean }
	| { invisible?: boolean; ephemeral: true }
);

export interface SchedulerPluginTrigger extends TriggerBase {
	type: 'plugin';
	plugin_id: string;
	params: JobParams;
}

/** A scheduler, launch, or scheduling-modifier rule attached to an Event. */
export type Trigger =
	| ManualTrigger
	| ScheduleTrigger
	| IntervalTrigger
	| SingleTrigger
	| MagicTrigger
	| KeyboardTrigger
	| StartupTrigger
	| CatchupTrigger
	| NthTrigger
	| RangeTrigger
	| BlackoutTrigger
	| DelayTrigger
	| PrecisionTrigger
	| QuietTrigger
	| SchedulerPluginTrigger;

/** One node in a stored workflow graph. */
export interface WorkflowNode {
	id: string;
	type: 'event' | 'job' | 'trigger' | 'limit' | 'action' | 'controller' | 'note';
	data?: JobDataMap;
	x: number;
	y: number;
	[key: string]: unknown;
}

/** One directed connection in a stored workflow graph. */
export interface WorkflowConnection {
	id: string;
	source: string;
	dest: string;
	condition?: JobActionCondition;
	[key: string]: unknown;
}

/** The graph stored on a workflow Event. */
export interface Workflow {
	nodes: WorkflowNode[];
	connections: WorkflowConnection[];
	/** Optional starting node override used when launching a workflow. */
	start?: string;
	[key: string]: unknown;
}

/** A stored xyOps Event definition. */
export interface Event {
	id: string;
	title: string;
	enabled: boolean;
	username: string;
	modified: number;
	created: number;
	category: string;
	targets: string[];
	plugin: string;
	params: JobParams;
	limits: Limit[];
	actions: Action[];
	triggers: Trigger[];
	revision: number;
	type?: 'workflow';
	workflow?: Workflow;
	icon?: string;
	fields?: JobField[];
	tags?: string[];
	expression?: string;
	algo?: EventAlgorithm;
	notes?: string;
	[key: string]: unknown;
}

/** Event fields shared by standard and workflow create requests. */
export interface CreateEventBase {
	/** Optional custom ID. xyOps generates one when omitted. */
	id?: string;
	title: string;
	enabled: boolean;
	category: string;
	icon?: string;
	params?: JobParams;
	fields?: JobField[];
	tags?: string[];
	expression?: string;
	limits?: Limit[];
	actions?: Action[];
	triggers?: Trigger[];
	notes?: string;
	/** Initial values for internal Event state, such as catch-up cursors. */
	update_state?: JobDataMap;
}

/** Properties required to create a standard Event. */
export interface CreateStandardEventRequest extends CreateEventBase {
	type?: never;
	targets: string[];
	algo: EventAlgorithm;
	plugin: string;
	workflow?: never;
}

/** Properties required to create a workflow Event. */
export interface CreateWorkflowEventRequest extends CreateEventBase {
	type: 'workflow';
	workflow: Workflow;
	/** The server supplies _workflow regardless of this input. */
	plugin?: never;
	/** The server supplies an empty target list for workflows. */
	targets?: never;
	algo?: never;
}

/** Request used to create either a standard or workflow Event. */
export type CreateEventRequest = CreateStandardEventRequest | CreateWorkflowEventRequest;

/** Sparse Event fields accepted by updateEvent. */
export interface UpdateEventRequest {
	id: string;
	title?: string;
	enabled?: boolean;
	category?: string;
	targets?: string[];
	algo?: EventAlgorithm;
	plugin?: string;
	params?: JobParams;
	fields?: JobField[];
	tags?: string[];
	expression?: string;
	limits?: Limit[];
	actions?: Action[];
	triggers?: Trigger[];
	workflow?: Workflow;
	icon?: string;
	notes?: string;
	/** Optional optimistic-concurrency revision check. */
	revision?: number;
	/** Values to write into internal Event state without persisting on Event. */
	update_state?: JobDataMap;
	/** Event subtype cannot be changed after creation. */
	type?: never;
}

/** Request used to fetch one Event. */
export interface EventIDRequest {
	id: string;
}

/** Request used to delete one Event and optionally its historical Jobs. */
export interface DeleteEventRequest extends EventIDRequest {
	delete_jobs?: boolean;
}

/** Optional filtering by any top-level Event property. */
export type GetEventsRequest = Partial<Event>;

/** Pagination and sorting accepted by Event revision history. */
export interface GetEventHistoryRequest extends EventIDRequest {
	offset?: number;
	limit?: number;
	sort_by?: string;
	sort_dir?: -1 | 1;
}

/** An activity-log record returned by getEventHistory. */
export interface EventHistoryRecord {
	id: string;
	action: 'event_create' | 'event_update' | 'event_delete';
	description: string;
	epoch: number;
	keywords?: string[];
	username?: string;
	/** Event snapshot included with create, update, and delete transactions. */
	event?: Event;
	[key: string]: unknown;
}

/** Job input supplied to runEvent. Either data or files may be omitted. */
export interface RunEventInput {
	data?: JobDataMap;
	files?: File[];
	[key: string]: unknown;
}

/** Optional Event and Job properties which may be overridden for one run. */
export interface RunEventOverrides {
	params?: JobParams;
	input?: RunEventInput;
	test?: boolean;
	tags?: string[];
	targets?: string[];
	algo?: EventAlgorithm;
	plugin?: string;
	category?: string;
	enabled?: boolean;
	fields?: JobField[];
	expression?: string;
	limits?: Limit[];
	actions?: Action[];
	triggers?: Trigger[];
	workflow?: Workflow;
	icon?: string;
	notes?: string;
	[key: string]: unknown;
}

/** Run an Event selected by ID or, when ID is omitted, by exact title. */
export type RunEventRequest = RunEventOverrides & (
	| { id: string; title?: string }
	| { id?: never; title: string }
);

export interface GetEventsResponse extends APIResponseData {
	rows: Event[];
	list: APIList;
}

export interface GetEventResponse extends APIResponseData {
	event: Event;
	jobs: JobRecord[];
	queued: number;
}

export interface GetEventHistoryResponse extends APIResponseData {
	rows: EventHistoryRecord[];
	list: APIList;
}

export interface EventResponse extends APIResponseData {
	event: Event;
}

export interface RunEventResponse extends APIResponseData {
	/** Newly launched Job ID. */
	id: string;
}

//
// Files
//

/** Empty request body used when uploading general-purpose user files. */
export interface UploadFilesRequest extends APIRequestData {}

/** Upload one file generated by, or otherwise associated with, a Job. */
export interface UploadJobFileRequest {
	/** Job ID to associate with the uploaded file. */
	id: string;
	/** API key, server token, or Job token accepted by the endpoint. */
	auth: string;
	/** Server ID required when auth contains a server token. */
	server?: string;
}

/** Delete one stored file registered on a Job. */
export interface DeleteJobFileRequest {
	id: string;
	/** Exact storage path found in Job.files or Job.input.files. */
	path: string;
}

/** Empty request body used when pre-uploading Job input files. */
export interface UploadJobInputFilesRequest extends APIRequestData {}

export interface UploadFilesResponse extends APIResponseData {
	/** Absolute URLs for all uploaded files, in upload order. */
	urls: string[];
}

export interface UploadJobFileResponse extends APIResponseData {
	/** Internal storage path assigned to the uploaded file. */
	key: string;
	/** Uploaded file size in bytes. */
	size: number;
}

export interface UploadJobInputFilesResponse extends APIResponseData {
	/** Metadata suitable for passing to runEvent under input.files. */
	files: File[];
}

//
// Groups
//

/** A stored xyOps server Group definition. */
export interface Group {
	id: string;
	title: string;
	hostname_match: string;
	sort_order: number;
	username: string;
	modified: number;
	created: number;
	revision: number;
	icon?: string;
	alert_actions: Action[];
	notes?: string;
	/** Default per-server concurrency limit. Zero means unlimited. */
	max_jobs_per_server?: number;
	[key: string]: unknown;
}

/** Properties accepted when creating a server Group. */
export interface CreateGroupRequest {
	/** Optional custom ID. xyOps generates one when omitted. */
	id?: string;
	title: string;
	hostname_match: string;
	icon?: string;
	alert_actions?: Action[];
	notes?: string;
	max_jobs_per_server?: number;
}

/** Sparse properties accepted when updating a server Group. */
export interface UpdateGroupRequest {
	id: string;
	title?: string;
	hostname_match?: string;
	icon?: string;
	alert_actions?: Action[];
	notes?: string;
	max_jobs_per_server?: number;
}

/** Request used to fetch or delete one Group. */
export interface GroupIDRequest {
	id: string;
}

/** One documented sort-order update in a multi-update request. */
export interface GroupSortOrderUpdate {
	id: string;
	sort_order: number;
}

/** Reorder one or more Groups. */
export interface MultiUpdateGroupRequest {
	items: [GroupSortOrderUpdate, ...GroupSortOrderUpdate[]];
}

/** Start a timed Group snapshot watch, or cancel one using duration zero. */
export interface WatchGroupRequest extends GroupIDRequest {
	/** Watch duration in seconds. Zero cancels the current watch. */
	duration: number;
}

/** Create an immediate snapshot from the latest data for one Group. */
export interface CreateGroupSnapshotRequest {
	group: string;
}

export interface GetGroupsResponse extends APIResponseData {
	rows: Group[];
	list: APIList;
}

export interface GetGroupResponse extends APIResponseData {
	group: Group;
}

export interface CreateGroupResponse extends APIResponseData {
	group: Group;
}

export interface CreateGroupSnapshotResponse extends APIResponseData {
	/** Newly created GroupSnapshot ID. */
	id: string;
}

//
// Jobs
//

/** Job data returned by APIs, without the local runtime helper methods. */
export interface JobRecord extends Partial<JobData> {
	id: string;
	[key: string]: unknown;
}

/** Any top-level Job property, plus dotted workflow fields, may be filtered. */
export interface ActiveJobFilterRequest extends Partial<JobData> {
	/** Parent workflow Job ID using the dotted query form. */
	'workflow.job'?: string;
	/** Parent workflow Event ID using the dotted query form. */
	'workflow.event'?: string;
	/** Workflow node ID using the dotted query form. */
	'workflow.node'?: string;
}

/** Filters, sorting, and pagination accepted by getActiveJobs. */
export interface GetActiveJobsRequest extends ActiveJobFilterRequest {
	offset?: number;
	/** Zero or omission returns all matching active Jobs. */
	limit?: number;
	sort_by?: string;
	sort_dir?: -1 | 1;
}

/** String-keyed counters used in active Job summaries. */
export interface JobSummaryCounters {
	[key: string]: number;
}

/** Active Job counters for one Event. */
export interface ActiveJobEventSummary {
	id: string;
	states: JobSummaryCounters;
	sources: JobSummaryCounters;
	targets: JobSummaryCounters;
}

/** Request used to fetch one running or completed Job. */
export interface GetJobRequest {
	id: string;
	/** Top-level properties to omit from the returned Job. */
	remove?: string[];
}

/** Request used to fetch multiple Jobs while preserving ID order. */
export interface GetJobsRequest {
	ids: [string, ...string[]];
	/** Include heavy fields which are pruned by default. */
	verbose?: boolean;
}

/** Per-item error returned in getJobs when a requested Job cannot be loaded. */
export interface JobLookupError {
	err: APIError;
	[key: string]: unknown;
}

/** Request shared by Job log retrieval and other single-Job actions. */
export interface JobIDRequest {
	id: string;
}

/** Token-authenticated request used by direct Job log URLs. */
export interface JobLogTokenRequest extends JobIDRequest {
	t: string;
}

/** Request for an end-aligned chunk of a live Job log. */
export interface TailLiveJobLogRequest extends JobIDRequest {
	/** Approximate maximum byte count. Defaults to 32678. */
	bytes?: number;
}

/** Request used to stream one live Job. */
export interface StreamJobRequest extends JobIDRequest {
	/** Magic Link stream token, when not using normal authentication. */
	token?: string;
}

/** One parsed update emitted by the SDK's streamJob iterator. */
export interface JobStreamUpdate extends Partial<JobData> {
	xy: 1;
	/** Indicates that the final Job record could not be loaded. */
	error?: boolean;
	[key: string]: unknown;
}

export type JobStreamIterator = (update: JobStreamUpdate) => void;

/** Options-object form accepted by streamJob. */
export type JobStreamOptions = Omit<APIRequestOptions, 'download' | 'iterator'> & {
	iterator: JobStreamIterator;
};

/** Admin-only sparse update for any running or completed Job property. */
export interface UpdateJobRequest extends Partial<JobData> {
	id: string;
}

/** Resume a suspended Job with optional parameter values and workflow redirect. */
export interface ResumeJobRequest extends JobIDRequest {
	params?: JobParams;
	redirect?: string;
}

/** Replace all public tags on a completed Job. */
export interface ManageJobTagsRequest extends JobIDRequest {
	tags: string[];
}

/** Replace all Ticket associations on a completed Job. */
export interface ManageJobTicketsRequest extends JobIDRequest {
	tickets: string[];
}

/** Flush all queued Jobs belonging to one Event ID. */
export interface FlushEventQueueRequest {
	id: string;
}

export interface GetActiveJobsResponse extends APIResponseData {
	rows: JobRecord[];
	list: APIList;
}

export interface GetActiveJobSummaryResponse extends APIResponseData {
	events: Record<string, ActiveJobEventSummary>;
}

export interface GetWorkflowJobSummaryResponse extends APIResponseData {
	nodes: Record<string, number>;
}

export interface GetJobResponse extends APIResponseData {
	job: JobRecord;
	/** Token accepted by the direct view_job_log and download_job_log routes. */
	token: string;
}

export interface GetJobsResponse extends APIResponseData {
	jobs: Array<JobRecord | JobLookupError>;
}

export interface TailLiveJobLogResponse extends APIResponseData {
	text: string;
}

export interface JobToggleNotifyMeResponse extends APIResponseData {
	enabled: boolean;
}

export interface FlushEventQueueResponse extends APIResponseData {
	count: number;
}

//
// Monitors
//

/** Numeric formats supported by Monitor definitions. */
export type MonitorDataType = 'integer' | 'float' | 'bytes' | 'seconds' | 'milliseconds';

/** A stored xyOps Monitor definition. */
export interface Monitor {
	id: string;
	title: string;
	source: string;
	data_type: MonitorDataType;
	username: string;
	modified: number;
	created: number;
	revision: number;
	sort_order: number;
	display?: boolean;
	icon?: string;
	groups?: string[];
	data_match?: string;
	min_vert_scale?: number;
	suffix?: string;
	delta?: boolean;
	divide_by_delta?: boolean;
	/** False disables the minimum; any number, including zero, enables it. */
	delta_min_value?: false | number;
	notes?: string;
	[key: string]: unknown;
}

/** Properties accepted when creating a Monitor. */
export interface CreateMonitorRequest {
	/** Optional custom ID. xyOps generates one when omitted. */
	id?: string;
	title: string;
	source: string;
	data_type: MonitorDataType;
	display?: boolean;
	icon?: string;
	groups?: string[];
	data_match?: string;
	min_vert_scale?: number;
	suffix?: string;
	delta?: boolean;
	divide_by_delta?: boolean;
	delta_min_value?: false | number;
	notes?: string;
}

/** Sparse Monitor fields accepted by updateMonitor. */
export interface UpdateMonitorRequest extends Partial<CreateMonitorRequest> {
	id: string;
}

/** Request used to fetch or delete one Monitor. */
export interface MonitorIDRequest {
	id: string;
}

/** Evaluate a candidate Monitor against one server's current data. */
export interface TestMonitorRequest {
	server: string;
	source: string;
	data_type: MonitorDataType;
	data_match?: string;
}

/** One documented sort-order update in a Monitor multi-update request. */
export interface MonitorSortOrderUpdate {
	id: string;
	sort_order: number;
}

/** Reorder one or more Monitor definitions. */
export interface MultiUpdateMonitorRequest {
	items: [MonitorSortOrderUpdate, ...MonitorSortOrderUpdate[]];
}

/** A map of numeric metric IDs to their sampled values. */
export interface MonitorValueMap {
	[id: string]: number;
}

/** One network connection in ServerMonitorData. */
export interface ServerConnectionData {
	bytes_in: number;
	bytes_out: number;
	local_addr: string;
	pid: number;
	remote_addr: string;
	state: string;
	type: string;
	[key: string]: unknown;
}

/** CPU time percentages for one CPU or the combined total. */
export interface ServerCPUUsage {
	user: number;
	nice: number;
	system: number;
	idle: number;
	iowait: number;
	irq: number;
	softirq: number;
	active: number;
	[key: string]: number;
}

/** CPU hardware and current usage information. */
export interface ServerCPUData {
	avgLoad?: number;
	currentLoad?: number;
	cpus?: ServerCPUUsage[];
	totals?: ServerCPUUsage;
	brand?: string;
	combo?: string;
	cores?: number;
	physicalCores?: number;
	performanceCores?: number;
	efficiencyCores?: number;
	processors?: number;
	speed?: number;
	speedMin?: number;
	speedMax?: number;
	virtualization?: boolean;
	cache?: Record<string, string | number>;
	[key: string]: unknown;
}

/** Current information for one network interface. */
export interface ServerNetworkInterfaceData {
	iface: string;
	ifaceName?: string;
	default?: boolean;
	ip4?: string;
	ip4subnet?: string;
	ip6?: string;
	ip6subnet?: string;
	mac?: string;
	internal?: boolean;
	virtual?: boolean;
	operstate?: string;
	type?: string;
	duplex?: string;
	mtu?: number;
	speed?: number | null;
	rx_bytes?: number;
	rx_dropped?: number;
	rx_errors?: number;
	rx_sec?: number;
	tx_bytes?: number;
	tx_dropped?: number;
	tx_errors?: number;
	tx_sec?: number;
	[key: string]: unknown;
}

/** Current information for one mounted filesystem. */
export interface ServerMountData {
	fs: string;
	type: string;
	size: number;
	used: number;
	available: number;
	use: number;
	mount: string;
	rw: boolean;
	[key: string]: unknown;
}

/** Operating system details included in ServerMonitorData. */
export interface ServerOSData {
	arch?: string;
	build?: string;
	codename?: string;
	codepage?: string;
	distro?: string;
	fqdn?: string;
	hostname?: string;
	kernel?: string;
	logofile?: string;
	platform?: string;
	release?: string;
	serial?: string;
	servicepack?: string;
	uefi?: boolean;
	[key: string]: unknown;
}

/** xySat process usage included in ServerMonitorData. */
export interface ServerProcessData {
	pid?: number;
	cpu: number;
	mem: number;
	started: number;
	[key: string]: unknown;
}

/** One operating-system process in the detailed process list. */
export interface ServerProcessInfo {
	pid: number;
	parentPid?: number;
	command?: string;
	user?: string;
	group?: string;
	state?: string;
	cpu?: number;
	mem?: number;
	memRss?: number;
	memVsz?: number;
	started?: number;
	age?: number;
	[key: string]: unknown;
}

/** Process state counters and detailed process rows. */
export interface ServerProcessesData {
	all: number;
	list: ServerProcessInfo[];
	running?: number;
	sleeping?: number;
	[key: string]: unknown;
}

/** Filesystem, I/O, network, and uptime statistics. */
export interface ServerMonitorStats {
	fs?: APIRequestData;
	io?: APIRequestData;
	network?: APIRequestData;
	uptime_sec?: number;
	[key: string]: unknown;
}

/** Current full monitoring snapshot collected by xySat. */
export interface ServerMonitorData {
	arch?: string;
	commands?: Record<string, string>;
	conns?: ServerConnectionData[];
	cpu?: ServerCPUData;
	deltas?: MonitorValueMap;
	interfaces?: Record<string, ServerNetworkInterfaceData>;
	jobs?: number;
	load?: number[];
	memory?: MonitorValueMap;
	monitors?: MonitorValueMap;
	mounts?: Record<string, ServerMountData>;
	os?: ServerOSData;
	platform?: 'aix' | 'darwin' | 'freebsd' | 'linux' | 'openbsd' | 'sunos' | 'win32' | (string & {});
	process?: ServerProcessData;
	processes?: ServerProcessesData;
	release?: string;
	stats?: ServerMonitorStats;
	[key: string]: unknown;
}

/** Stored wrapper around one server's latest monitoring data. */
export interface ServerMonitorSnapshot {
	date?: number;
	ip?: string;
	hostname?: string;
	groups?: string[];
	data: ServerMonitorData;
	alerts?: Record<string, unknown>;
	[key: string]: unknown;
}

/** One one-second QuickMon sample. */
export interface QuickmonData {
	date: number;
	[monitorID: string]: number;
}

/** One aggregated time-series Monitor sample. */
export interface ServerTimelineData {
	count: number;
	date: number;
	epoch_div: number;
	totals: MonitorValueMap;
	[key: string]: unknown;
}

/** Built-in Monitor timeline resolutions. */
export type MonitorTimelineSystem = 'hourly' | 'daily' | 'monthly' | 'yearly';

/** Optionally limit QuickMon data to one server or Group. */
export interface GetQuickmonDataRequest {
	server?: string;
	group?: string;
}

/** Fetch the latest samples and current data for one server. */
export interface GetLatestMonitorDataRequest {
	server: string;
	sys: MonitorTimelineSystem;
	limit: number;
}

/** Fetch historical samples beginning at a Unix timestamp. */
export interface GetHistoricalMonitorDataRequest extends GetLatestMonitorDataRequest {
	date: number;
}

export interface GetMonitorsResponse extends APIResponseData {
	rows: Monitor[];
	list: APIList;
}

export interface GetMonitorResponse extends APIResponseData {
	monitor: Monitor;
}

export interface CreateMonitorResponse extends APIResponseData {
	monitor: Monitor;
}

/** Successful test result or an expression-evaluation miss. */
export type TestMonitorResponse =
	| (APIResponseData & { value: number; fail?: never })
	| (APIResponseData & { value?: never; fail: true });

export interface GetQuickmonDataResponse extends APIResponseData {
	servers: Record<string, QuickmonData[]>;
}

export interface GetLatestMonitorDataResponse extends APIResponseData {
	rows: ServerTimelineData[];
	/** Stored host wrapper containing current ServerMonitorData under data. */
	data: ServerMonitorSnapshot;
}

export interface GetHistoricalMonitorDataResponse extends APIResponseData {
	rows: ServerTimelineData[];
}

//
// Plugins
//

/** The four execution roles supported by xyOps Plugins. */
export type PluginType = 'event' | 'monitor' | 'action' | 'scheduler';

/** Monitor Plugin output formats understood by xyOps. */
export type PluginMonitorFormat = 'text' | 'json' | 'xml';

/** Process termination strategies supported by Event Plugins. */
export type PluginKillMode = 'none' | 'parent' | 'all';

/** A numeric ID or account name used to launch a Plugin process. */
export type PluginCredential = string | number;

/** UI controls supported by Plugin parameter definitions. */
export type PluginParameterType =
	| 'text'
	| 'textarea'
	| 'code'
	| 'json'
	| 'checkbox'
	| 'select'
	| 'bucket'
	| 'system'
	| 'hidden'
	| 'toolset'
	| 'group';

/** HTML input variants supported by text Plugin parameters. */
export type PluginTextVariant =
	| 'color'
	| 'date'
	| 'datetime-local'
	| 'email'
	| 'number'
	| 'text'
	| 'time'
	| 'tel'
	| 'url';

/** Control types accepted for fields nested inside a toolset. */
export type PluginToolFieldType =
	| 'checkbox'
	| 'code'
	| 'json'
	| 'hidden'
	| 'select'
	| 'text'
	| 'textarea';

/** Properties shared by all fields nested inside a toolset. */
export interface PluginToolFieldBase {
	id: string;
	title: string;
	caption?: string;
	regex?: string;
	required?: boolean;
	locked?: boolean;
	[key: string]: unknown;
}

/** A boolean field nested inside a toolset. */
export interface PluginToolCheckboxField extends PluginToolFieldBase {
	type: 'checkbox';
	value: boolean;
}

/** A JSON field nested inside a toolset. */
export interface PluginToolJSONField extends PluginToolFieldBase {
	type: 'json';
	value: JobDataMap | unknown[] | null;
}

/** A numeric text field nested inside a toolset. */
export interface PluginToolNumberField extends PluginToolFieldBase {
	type: 'text';
	variant: 'number';
	value: number | null;
}

/** A string-valued field nested inside a toolset. */
export interface PluginToolTextField extends PluginToolFieldBase {
	type: Exclude<PluginToolFieldType, 'checkbox' | 'json'>;
	variant?: Exclude<PluginTextVariant, 'number'>;
	value: string;
}

/** One user-configurable field nested inside a toolset tool. */
export type PluginToolField =
	| PluginToolCheckboxField
	| PluginToolJSONField
	| PluginToolNumberField
	| PluginToolTextField;

/** One executable choice inside a toolset Plugin parameter. */
export interface PluginTool {
	id: string;
	title: string;
	description?: string;
	fields?: PluginToolField[];
	[key: string]: unknown;
}

/** Data required by a toolset Plugin parameter. */
export interface PluginToolsetData {
	tools: [PluginTool, ...PluginTool[]];
	[key: string]: unknown;
}

/** Properties shared by all Plugin parameter definitions. */
export interface PluginParameterBase {
	id: string;
	title: string;
	type: PluginParameterType;
	value?: unknown;
	caption?: string;
	required?: boolean;
	locked?: boolean;
	regex?: string;
	/** Optional numeric range used by compatible controls. */
	range?: [minimum: number, maximum: number];
	/** Backing system list used by system controls. */
	list_id?: string;
	/** Allow multiple selections in a compatible menu control. */
	multiple?: boolean;
	[key: string]: unknown;
}

/** A text Plugin parameter with an optional HTML input variant. */
export interface PluginTextParameter extends PluginParameterBase {
	type: 'text';
	variant?: PluginTextVariant;
}

/** A toolset Plugin parameter with its nested tool definitions. */
export interface PluginToolsetParameter extends PluginParameterBase {
	type: 'toolset';
	data: PluginToolsetData;
}

/** A non-text, non-toolset Plugin parameter. */
export interface PluginStandardParameter extends PluginParameterBase {
	type: Exclude<PluginParameterType, 'text' | 'toolset'>;
	data?: JobDataMap;
}

/** One validated user parameter exposed by a Plugin. */
export type PluginParameter =
	| PluginTextParameter
	| PluginToolsetParameter
	| PluginStandardParameter;

/** Marketplace package metadata retained on an installed Plugin. */
export interface PluginMarketplaceMetadata {
	id: string;
	version: string;
	[key: string]: unknown;
}

/** Properties shared by all stored xyOps Plugin definitions. */
export interface PluginBase {
	id: string;
	title: string;
	/** Current definitions use booleans; older stock definitions may use 0 or 1. */
	enabled: boolean | 0 | 1;
	type: PluginType;
	command?: string;
	script?: string;
	icon?: string;
	uid?: PluginCredential;
	gid?: PluginCredential;
	notes?: string;
	username: string;
	modified: number;
	created: number;
	revision: number;
	marketplace?: PluginMarketplaceMetadata;
	/** Marks definitions installed with xyOps itself. */
	stock?: boolean;
	/** Optional working directory used by action and scheduler processes. */
	cwd?: string;
	/** Optional action or scheduler process timeout in seconds. */
	timeout?: number;
	[key: string]: unknown;
}

/** A stored Event Plugin definition. */
export interface EventPlugin extends PluginBase {
	type: 'event';
	params?: PluginParameter[];
	kill?: PluginKillMode;
	runner?: boolean;
}

/** A stored Monitor Plugin definition. */
export interface MonitorPlugin extends PluginBase {
	type: 'monitor';
	groups?: string[];
	format?: PluginMonitorFormat;
	/** Also run this Plugin every second as part of QuickMon. */
	quick?: boolean;
}

/** A stored Action Plugin definition. */
export interface ActionPlugin extends PluginBase {
	type: 'action';
	params?: PluginParameter[];
}

/** A stored Scheduler Plugin definition. */
export interface SchedulerPlugin extends PluginBase {
	type: 'scheduler';
	params?: PluginParameter[];
}

/** Any stored xyOps Plugin definition. */
export type Plugin = EventPlugin | MonitorPlugin | ActionPlugin | SchedulerPlugin;

/** Properties shared by all Plugin create requests. */
export interface CreatePluginBase {
	/** Optional custom ID. xyOps generates one when omitted. */
	id?: string;
	title: string;
	enabled?: boolean | 0 | 1;
	type: PluginType;
	command?: string;
	script?: string;
	icon?: string;
	uid?: PluginCredential;
	gid?: PluginCredential;
	notes?: string;
	marketplace?: PluginMarketplaceMetadata;
	cwd?: string;
	timeout?: number;
}

/** Properties accepted when creating an Event Plugin. */
export interface CreateEventPluginRequest extends CreatePluginBase {
	type: 'event';
	params?: PluginParameter[];
	kill?: PluginKillMode;
	runner?: boolean;
}

/** Properties accepted when creating a Monitor Plugin. */
export interface CreateMonitorPluginRequest extends CreatePluginBase {
	type: 'monitor';
	groups?: string[];
	format?: PluginMonitorFormat;
	quick?: boolean;
}

/** Properties accepted when creating an Action Plugin. */
export interface CreateActionPluginRequest extends CreatePluginBase {
	type: 'action';
	params?: PluginParameter[];
}

/** Properties accepted when creating a Scheduler Plugin. */
export interface CreateSchedulerPluginRequest extends CreatePluginBase {
	type: 'scheduler';
	params?: PluginParameter[];
}

/** Request used to create any supported Plugin type. */
export type CreatePluginRequest =
	| CreateEventPluginRequest
	| CreateMonitorPluginRequest
	| CreateActionPluginRequest
	| CreateSchedulerPluginRequest;

/** Sparse Plugin fields accepted by updatePlugin. */
export interface UpdatePluginRequest {
	id: string;
	title?: string;
	enabled?: boolean | 0 | 1;
	type?: PluginType;
	command?: string;
	script?: string;
	icon?: string;
	params?: PluginParameter[];
	groups?: string[];
	format?: PluginMonitorFormat | '';
	quick?: boolean;
	uid?: PluginCredential;
	gid?: PluginCredential;
	kill?: PluginKillMode;
	runner?: boolean;
	notes?: string;
	marketplace?: PluginMarketplaceMetadata;
	cwd?: string;
	timeout?: number;
}

/** Request used to fetch or delete one Plugin. */
export interface PluginIDRequest {
	id: string;
}

/** Run an existing Monitor Plugin once on a selected server. */
export interface TestMonitorPluginRequest extends PluginIDRequest {
	server: string;
}

/** Test one Scheduler Plugin against a selected point in time. */
export interface TestSchedulerPluginRequest extends PluginIDRequest {
	timezone?: string;
	epoch?: number;
	params?: JobParams;
}

/** One launch decision returned by a Scheduler Plugin. */
export interface SchedulerPluginLaunchResult {
	launch: boolean;
	invisible?: boolean;
	delay?: number;
	data?: JobDataMap;
	[key: string]: unknown;
}

/** Parsed JSON emitted by a Scheduler Plugin test. */
export interface SchedulerPluginTestData {
	xy: unknown;
	items: [boolean | SchedulerPluginLaunchResult, ...(boolean | SchedulerPluginLaunchResult)[]];
	[key: string]: unknown;
}

export interface GetPluginsResponse extends APIResponseData {
	rows: Plugin[];
	list: APIList;
}

export interface GetPluginResponse extends APIResponseData {
	plugin: Plugin;
}

export interface PluginResponse extends APIResponseData {
	plugin: Plugin;
}

/** Raw result returned by a remote Monitor Plugin test. */
export interface TestMonitorPluginResponse extends APIResponseData {
	result: unknown;
	stderr?: string;
	stdout?: string;
	request_id?: string;
}

/** Result returned by a Scheduler Plugin test, including process diagnostics. */
export interface TestSchedulerPluginResponse extends APIResponseData {
	/** True when the Plugin process or its output failed validation. */
	err?: boolean;
	data?: SchedulerPluginTestData;
	child_cmd?: string;
	stdout?: string;
	stderr?: string;
}

//
// Roles
//

/** Boolean forms found in current and legacy privilege maps. */
export type RolePrivilegeValue = boolean | 0 | 1;

/** Privileges assigned by one Role. Custom privilege IDs are also supported. */
export interface RolePrivileges {
	admin?: RolePrivilegeValue;
	create_alerts?: RolePrivilegeValue;
	edit_alerts?: RolePrivilegeValue;
	delete_alerts?: RolePrivilegeValue;
	create_buckets?: RolePrivilegeValue;
	edit_buckets?: RolePrivilegeValue;
	delete_buckets?: RolePrivilegeValue;
	create_categories?: RolePrivilegeValue;
	edit_categories?: RolePrivilegeValue;
	delete_categories?: RolePrivilegeValue;
	create_channels?: RolePrivilegeValue;
	edit_channels?: RolePrivilegeValue;
	delete_channels?: RolePrivilegeValue;
	create_events?: RolePrivilegeValue;
	edit_events?: RolePrivilegeValue;
	delete_events?: RolePrivilegeValue;
	create_groups?: RolePrivilegeValue;
	edit_groups?: RolePrivilegeValue;
	delete_groups?: RolePrivilegeValue;
	run_jobs?: RolePrivilegeValue;
	abort_jobs?: RolePrivilegeValue;
	delete_jobs?: RolePrivilegeValue;
	tag_jobs?: RolePrivilegeValue;
	comment_jobs?: RolePrivilegeValue;
	create_monitors?: RolePrivilegeValue;
	edit_monitors?: RolePrivilegeValue;
	delete_monitors?: RolePrivilegeValue;
	create_plugins?: RolePrivilegeValue;
	edit_plugins?: RolePrivilegeValue;
	delete_plugins?: RolePrivilegeValue;
	create_roles?: RolePrivilegeValue;
	edit_roles?: RolePrivilegeValue;
	delete_roles?: RolePrivilegeValue;
	create_tags?: RolePrivilegeValue;
	edit_tags?: RolePrivilegeValue;
	delete_tags?: RolePrivilegeValue;
	create_tickets?: RolePrivilegeValue;
	edit_tickets?: RolePrivilegeValue;
	delete_tickets?: RolePrivilegeValue;
	create_web_hooks?: RolePrivilegeValue;
	edit_web_hooks?: RolePrivilegeValue;
	delete_web_hooks?: RolePrivilegeValue;
	create_snapshots?: RolePrivilegeValue;
	delete_snapshots?: RolePrivilegeValue;
	add_servers?: RolePrivilegeValue;
	update_servers?: RolePrivilegeValue;
	send_emails?: RolePrivilegeValue;
	bulk_export?: RolePrivilegeValue;
	[privilegeID: string]: RolePrivilegeValue | undefined;
}

/** A stored xyOps user Role. */
export interface Role {
	id: string;
	title: string;
	/** A direct API caller can omit this, which leaves the Role disabled. */
	enabled?: boolean;
	icon?: string;
	privileges: RolePrivileges;
	/** Empty means unrestricted category access. */
	categories: string[];
	/** Empty means unrestricted server Group access. */
	groups: string[];
	notes?: string;
	username: string;
	modified: number;
	created: number;
	/** Older built-in Role records may not contain a revision. */
	revision?: number;
	[key: string]: unknown;
}

/** Properties accepted when creating a Role. */
export interface CreateRoleRequest {
	/** Optional custom ID. xyOps generates one when omitted. */
	id?: string;
	title: string;
	enabled?: boolean;
	icon?: string;
	privileges?: RolePrivileges;
	categories?: string[];
	groups?: string[];
	notes?: string;
}

/** Sparse Role fields accepted by updateRole. */
export interface UpdateRoleRequest extends Partial<CreateRoleRequest> {
	id: string;
}

/** Request used to fetch or delete one Role. */
export interface RoleIDRequest {
	id: string;
}

export interface GetRolesResponse extends APIResponseData {
	rows: Role[];
	list: APIList;
}

export interface GetRoleResponse extends APIResponseData {
	role: Role;
}

export interface CreateRoleResponse extends APIResponseData {
	role: Role;
}

//
// Search
//

/** Sort direction accepted by all Unbase-backed search methods. */
export type SearchSortDirection = -1 | 1;

/** Query, pagination, and sorting options shared by search methods. */
export interface SearchRequest {
	query?: string;
	offset?: number;
	limit?: number;
	sort_by?: string;
	sort_dir?: SearchSortDirection;
}

/** Search completed Jobs without selecting a custom field subset. */
export interface SearchJobsRequest extends SearchRequest {
	/** Include large Job properties which are pruned by default. */
	verbose?: true | 1;
	select?: never;
}

/** Search completed Jobs and return only selected top-level properties. */
export interface SearchJobsSelectRequest extends SearchRequest {
	select: string | readonly string[];
	verbose?: never;
}

/** Search server snapshots with optional verbose nested data. */
export interface SearchSnapshotsRequest extends SearchRequest {
	verbose?: true | 1;
}

/** Search complete Ticket records. */
export interface SearchTicketsRequest extends SearchRequest {
	compact?: never;
}

/** Search compact Ticket records with body omitted and changes counted. */
export interface SearchCompactTicketsRequest extends SearchRequest {
	/** The SDK query string must use 1; the string "true" is not recognized. */
	compact: 1;
}

/** Data types accepted by the revision history filter. */
export type RevisionHistoryType =
	| 'alerts'
	| 'categories'
	| 'channels'
	| 'events'
	| 'groups'
	| 'monitors'
	| 'plugins'
	| 'tags'
	| 'web_hooks'
	| 'buckets'
	| 'secrets'
	| 'tickets'
	| 'roles';

/** Search revision activity for one supported definition type. */
export interface SearchRevisionHistoryRequest extends SearchRequest {
	type: RevisionHistoryType;
}

/** Fetch daily system statistic history. */
export interface SearchStatHistoryRequest {
	offset?: number;
	limit?: number;
	/** Dot-separated path into each daily statistics object. */
	path?: string;
	/** Retain only object keys beginning with this prefix. */
	key_prefix?: string;
	/** Include the current, incomplete day. Omit this property to disable it. */
	current_day?: true | 1;
}

/** Hardware, operating system, and xySat information stored for a Server. */
export interface ServerInfo {
	arch?: string;
	booted?: number;
	cpu?: ServerCPUData;
	deltas?: MonitorValueMap;
	memory?: MonitorValueMap;
	monitors?: MonitorValueMap;
	node?: string;
	os?: ServerOSData;
	platform?: string;
	process?: ServerProcessData;
	release?: string;
	satellite?: string;
	virt?: {
		vendor?: string;
		[key: string]: unknown;
	};
	features?: Record<string, boolean>;
	[key: string]: unknown;
}

/** A current or historical xyOps Server record. */
export interface ServerRecord {
	id: string;
	hostname: string;
	ip: string;
	title?: string;
	icon?: string;
	userData?: JobDataMap;
	autoGroup?: boolean;
	created: number;
	modified: number;
	groups: string[];
	enabled: boolean;
	maxJobs?: number;
	/** Current records store a comma-delimited string; older data may use an array. */
	keywords?: string | string[];
	socket_id?: string;
	info: ServerInfo;
	offline?: boolean;
	[key: string]: unknown;
}

/** Public name for the Server data structure documented by xyOps. */
export type Server = ServerRecord;

/** Ticket types built into xyOps. */
export type TicketType = 'issue' | 'feature' | 'release' | 'change' | 'maintenance' | 'question' | 'other';

/** Ticket workflow states built into xyOps. */
export type TicketStatus = 'open' | 'closed' | 'draft';

/** One Event shortcut attached to a Ticket. */
export interface TicketEvent {
	id: string;
	targets?: string[];
	algo?: EventAlgorithm | '';
	tags?: string[];
	params?: JobParams;
	[key: string]: unknown;
}

/** One audit change or comment attached to a Ticket. */
export interface TicketChange {
	/** The initial created change may not have an ID. */
	id?: string;
	type: 'change' | 'comment';
	username: string;
	date: number;
	key?: string;
	value?: unknown;
	body?: string;
	edited?: number;
	[key: string]: unknown;
}

/** A full xyOps Ticket record. */
export interface Ticket {
	id: string;
	num: number;
	subject: string;
	body: string;
	type?: TicketType;
	status: TicketStatus;
	category?: string;
	server?: string;
	assignees: string[];
	cc: string[];
	notify: string[];
	due: number;
	tags: string[];
	events?: TicketEvent[];
	files?: File[];
	changes: TicketChange[];
	username: string;
	created: number;
	modified: number;
	/** Reserved for per-item failures returned by getTickets. */
	err?: never;
	[key: string]: unknown;
}

/** Compact Ticket returned when searchTickets receives compact: 1. */
export interface CompactTicket {
	id: string;
	num: number;
	subject: string;
	body?: never;
	type?: TicketType;
	status: TicketStatus;
	category?: string;
	server?: string;
	assignees: string[];
	cc: string[];
	notify: string[];
	due: number;
	tags: string[];
	events?: TicketEvent[];
	files?: File[];
	changes: number;
	username: string;
	created: number;
	modified: number;
	[key: string]: unknown;
}

/** One searchable audit-log record. Action-specific data remains extensible. */
export interface Activity {
	id: string;
	action: string;
	description?: string;
	epoch: number;
	headers?: APIRequestHeaders;
	ip?: string;
	ips?: string[];
	keywords: string[];
	username?: string;
	/** Computed by searchActivity from the incoming User-Agent header. */
	useragent?: string;
	[key: string]: unknown;
}

/** Revision activity with sensitive network information removed. */
export interface RevisionActivity {
	id: string;
	action: string;
	description?: string;
	epoch: number;
	headers?: never;
	ip?: never;
	ips?: never;
	keywords: string[];
	username?: string;
	useragent?: string;
	[key: string]: unknown;
}

/** One historical or active invocation of an Alert definition. */
export interface AlertInvocation {
	id: string;
	active: boolean;
	alert: string;
	count: number;
	date: number;
	exp: string;
	groups: string[];
	jobs: string[];
	message: string;
	modified: number;
	notified: boolean;
	server: string;
	tickets?: string[];
	err?: never;
	[key: string]: unknown;
}

/** Sources which can create a Server snapshot. */
export type SnapshotSource = 'alert' | 'watch' | 'user' | 'job';

/** A snapshot captured from one Server. */
export interface ServerSnapshot {
	id: string;
	type: 'server';
	server: string;
	version?: string;
	date: number;
	groups: string[];
	hostname: string;
	ip: string;
	source: SnapshotSource;
	username?: string;
	quickmon: QuickmonData[];
	jobs: string[];
	alerts: string[];
	data: ServerMonitorData;
	[key: string]: unknown;
}

/** A complete snapshot captured from one Server Group. */
export interface GroupSnapshot {
	id: string;
	type: 'group';
	date: number;
	server: '';
	groups: [string];
	source?: SnapshotSource;
	username?: string;
	group_def: Group;
	servers: ServerRecord[];
	/** Stored host wrappers, with indices corresponding to servers. */
	snapshots: ServerMonitorSnapshot[];
	alerts: string[];
	jobs: string[];
	/** One QuickMon history array per corresponding Server. */
	quickmons: QuickmonData[][];
	[key: string]: unknown;
}

/** Group snapshot shape after non-verbose Search pruning. */
export interface GroupSnapshotSearchRecord {
	id: string;
	type: 'group';
	date: number;
	server: '';
	groups: [string];
	source?: SnapshotSource;
	username?: string;
	group_def?: Group;
	servers?: ServerRecord[];
	snapshots?: ServerMonitorSnapshot[];
	alerts: string[];
	jobs: string[];
	quickmons?: QuickmonData[][];
	[key: string]: unknown;
}

/** Any snapshot record returned by searchSnapshots. */
export type SnapshotSearchRecord = ServerSnapshot | GroupSnapshotSearchRecord;

/** One daily statistics entry, optionally narrowed to a selected subtree. */
export interface StatHistoryDay<T = unknown> {
	epoch: number;
	date: string;
	data: T;
}

/** Standard paginated row response shared by Unbase searches. */
export interface SearchRowsResponse<T> extends APIResponseData {
	rows: T[];
	list: APIList;
}

export type SearchJobsResponse<T = JobRecord> = SearchRowsResponse<T>;
export type SearchServersResponse = SearchRowsResponse<ServerRecord>;
export type SearchAlertsResponse = SearchRowsResponse<AlertInvocation>;
export type SearchSnapshotsResponse = SearchRowsResponse<SnapshotSearchRecord>;
export type SearchTicketsResponse = SearchRowsResponse<Ticket>;
export type SearchCompactTicketsResponse = SearchRowsResponse<CompactTicket>;
export type SearchActivityResponse = SearchRowsResponse<Activity>;
export type SearchRevisionHistoryResponse = SearchRowsResponse<RevisionActivity>;

export interface SearchStatHistoryResponse<T = unknown> extends APIResponseData {
	items: StatHistoryDay<T>[];
	list: APIList;
}

//
// Marketplace
//

/** Marketplace product kinds. Marketplace v1 currently contains Plugins. */
export type MarketplaceItemType = 'plugin' | (string & {});

/** Installation-state filters supported by the Marketplace UI and API. */
export type MarketplaceStatus = 'installed' | 'not';

/** One product listing from the xyOps Marketplace metadata catalog. */
export interface MarketplaceItem {
	id: string;
	title: string;
	author: string;
	description: string;
	/** Versions are ordered newest first. */
	versions: [string, ...string[]];
	type: MarketplaceItemType;
	plugin_type?: PluginType;
	license: string;
	tags: string[];
	requires: string[];
	/** Suggested Secret Vault variable names and optional defaults. */
	env?: Record<string, string>;
	created: string;
	modified: string;
	/** Optional project URL override; the GitHub repository is used by default. */
	repo_url?: string;
	[key: string]: unknown;
}

/** Search and filter Marketplace product listings. */
export interface MarketplaceSearchRequest {
	query?: string;
	type?: MarketplaceItemType;
	plugin_type?: PluginType;
	license?: string;
	author?: string;
	tags?: string | readonly string[];
	requires?: string | readonly string[];
	status?: MarketplaceStatus;
	sort_by?: string;
	sort_dir?: SearchSortDirection;
	offset?: number;
	limit?: number;
	id?: never;
	fields?: never;
	readme?: never;
	data?: never;
	logo?: never;
}

/** Fetch unique Marketplace field values used by search filters. */
export interface MarketplaceFieldsRequest {
	fields: true | 1;
	id?: never;
	readme?: never;
	data?: never;
	logo?: never;
}

/** Product and version selection shared by detail-fetching modes. */
export interface MarketplaceProductRequest {
	id: string;
	/** Defaults to the first, newest version in the product listing. */
	version?: string;
}

/** Fetch a product README in GitHub-Flavored Markdown. */
export interface MarketplaceReadmeRequest extends MarketplaceProductRequest {
	readme: true | 1;
	data?: never;
	logo?: never;
}

/** Fetch a product's xyOps Portable Data file. */
export interface MarketplaceDataRequest extends MarketplaceProductRequest {
	data: true | 1;
	readme?: never;
	logo?: never;
}

/** Direct-HTTP request for a binary product logo. Not supported by the SDK proxy. */
export interface MarketplaceLogoRequest extends MarketplaceProductRequest {
	logo: true | 1;
	readme?: never;
	data?: never;
}

/** Unique Marketplace values returned by fields mode. */
export interface MarketplaceFields {
	types: string[];
	plugin_types: string[];
	/** Runtime property name for command-line requirements. */
	requires: string[];
	tags: string[];
	licenses: string[];
	authors: string[];
}

/** Data identifiers supported by the xyOps Portable Data Format. */
export type XYPDFItemType =
	| 'alert'
	| 'api_key'
	| 'bucket'
	| 'category'
	| 'channel'
	| 'event'
	| 'group'
	| 'monitor'
	| 'plugin'
	| 'role'
	| 'tag'
	| 'web_hook'
	| (string & {});

/** One object wrapped inside an xyOps Portable Data file. */
export interface XYPDFItem<T = APIRequestData> {
	type: XYPDFItemType;
	data: T;
}

/** xyOps Portable Data Format returned by Marketplace data mode. */
export interface XYPDF<T = APIRequestData> {
	type: 'xypdf';
	version: '1.0' | (string & {});
	/** Minimum supported xyOps version. */
	xyops?: string;
	description?: string;
	items: [XYPDFItem<T>, ...XYPDFItem<T>[]];
}

/** Plugin data normally contained by Marketplace v1 XYPDF responses. */
export type MarketplacePluginData = CreatePluginRequest & { id: string };

export interface MarketplaceSearchResponse extends APIResponseData {
	rows: MarketplaceItem[];
	list: APIList;
}

export interface MarketplaceFieldsResponse extends APIResponseData {
	fields: MarketplaceFields;
}

export interface MarketplaceReadmeResponse extends APIResponseData {
	item: MarketplaceItem;
	version: string;
	text: string;
}

export interface MarketplaceDataResponse<T = MarketplacePluginData> extends APIResponseData {
	item: MarketplaceItem;
	version: string;
	data: XYPDF<T>;
}

//
// Secrets
//

/** One plaintext name/value pair submitted to or decrypted from a Secret Vault. */
export interface SecretField {
	/** POSIX environment variable name, such as DB_PASSWORD. */
	name: string;
	/** Secret values are stored and delivered as strings. */
	value: string;
}

/** Plaintext metadata for one stored xyOps Secret Vault. */
export interface Secret {
	id: string;
	title: string;
	/** Omitted values are treated as disabled by the runtime. */
	enabled?: boolean;
	icon?: string;
	notes?: string;
	/** Auto-generated plaintext field names. Secret values are not included. */
	names: string[];
	events?: string[];
	categories?: string[];
	plugins?: string[];
	web_hooks?: string[];
	username: string;
	modified: number;
	created: number;
	revision: number;
	[key: string]: unknown;
}

/** Properties accepted when creating a Secret Vault. */
export interface CreateSecretRequest {
	/** Optional custom ID. xyOps generates one when omitted. */
	id?: string;
	title: string;
	enabled?: boolean;
	icon?: string;
	notes?: string;
	events?: string[];
	categories?: string[];
	plugins?: string[];
	web_hooks?: string[];
	/** Values are encrypted and stored separately from Secret metadata. */
	fields?: SecretField[];
}

/** Sparse Secret Vault fields accepted by updateSecret. */
export interface UpdateSecretRequest {
	id: string;
	title?: string;
	enabled?: boolean;
	icon?: string;
	notes?: string;
	events?: string[];
	categories?: string[];
	plugins?: string[];
	web_hooks?: string[];
	/** When present, replaces the complete encrypted field collection. */
	fields?: SecretField[];
}

/** Request used to fetch, decrypt, or delete one Secret Vault. */
export interface SecretIDRequest {
	id: string;
}

export interface GetSecretsResponse extends APIResponseData {
	rows: Secret[];
	list: APIList;
}

export interface GetSecretResponse extends APIResponseData {
	secret: Secret;
}

export interface DecryptSecretResponse extends APIResponseData {
	fields: SecretField[];
}

export interface CreateSecretResponse extends APIResponseData {
	/** Created metadata only. Encrypted field values are not returned. */
	secret: Secret;
}

//
// Servers
//

/** Indexed Server fields included in the summary response. */
export type ServerSummaryField =
	| 'os_platform'
	| 'os_distro'
	| 'os_release'
	| 'os_arch'
	| 'cpu_virt'
	| 'cpu_brand'
	| 'cpu_cores';

/** Counts keyed by one indexed Server field value. */
export type ServerFieldSummary = Record<string, number>;

/** All field distributions returned by getServerSummaries. */
export type ServerSummaries = Record<ServerSummaryField, ServerFieldSummary>;

/** Request used to fetch, update, or delete one Server. */
export interface ServerIDRequest {
	id: string;
}

/** Server metadata accepted by updateServer. */
export interface UpdateServerRequest extends ServerIDRequest {
	title?: string;
	enabled?: boolean;
	icon?: string;
	groups?: string[];
	autoGroup?: boolean;
	maxJobs?: number;
	/** The endpoint also shallow-merges additional Server properties. */
	[key: string]: unknown;
}

interface UpdateServerDataRequestBase extends ServerIDRequest {
	/** Replace the entire userData object instead of shallow-merging it. */
	replace?: boolean;
}

/** Update Server user data using the documented data property. */
export interface UpdateServerDataRequestWithData extends UpdateServerDataRequestBase {
	data: JobDataMap;
	/** Runtime alias which is ignored when data is also present. */
	userData?: JobDataMap;
}

/** Update Server user data using the backward-compatible userData alias. */
export interface UpdateServerDataRequestWithAlias extends UpdateServerDataRequestBase {
	data?: never;
	userData: JobDataMap;
}

export type UpdateServerDataRequest =
	| UpdateServerDataRequestWithData
	| UpdateServerDataRequestWithAlias;

/** Uninstall a Server and optionally delete all retained history. */
export interface DeleteServerRequest extends ServerIDRequest {
	history?: boolean;
}

/** Start or cancel automatic one-minute Server snapshots. */
export interface WatchServerRequest extends ServerIDRequest {
	/** Duration in seconds. Set to zero to cancel the watch. */
	duration: number;
}

/** Create a snapshot from one active Server's latest monitoring data. */
export interface CreateSnapshotRequest {
	server: string;
}

/** Request used to delete one Server or Group snapshot. */
export interface SnapshotIDRequest {
	id: string;
}

export interface GetServerSummariesResponse extends APIResponseData {
	summaries: ServerSummaries;
}

export interface GetActiveServersResponse extends APIResponseData {
	rows: Server[];
	list: APIList;
}

export interface GetActiveServerResponse extends APIResponseData {
	server: Server;
}

export interface GetServerResponse extends APIResponseData {
	server: Server;
	/** Stored host wrapper. Current metrics are nested under data.data. */
	data: ServerMonitorSnapshot;
	online: boolean;
}

export interface UpdateServerDataResponse extends APIResponseData {
	/** Complete Server userData after the merge or replacement. */
	data: JobDataMap;
}

export interface CreateSnapshotResponse extends APIResponseData {
	/** ID of the newly stored Server snapshot. */
	id: string;
}

//
// Tags
//

/** A label which can be assigned to Events, Jobs, and Tickets. */
export interface Tag {
	id: string;
	title: string;
	icon?: string;
	notes?: string;
	username: string;
	modified: number;
	created: number;
	/** Present on API-created Tags; older built-in Tags may omit it. */
	revision?: number;
	[key: string]: unknown;
}

/** Properties accepted when creating a Tag. */
export interface CreateTagRequest {
	/** Optional custom ID. xyOps generates one when omitted. */
	id?: string;
	title: string;
	icon?: string;
	notes?: string;
}

/** Sparse Tag fields accepted by updateTag. */
export interface UpdateTagRequest {
	id: string;
	title?: string;
	icon?: string;
	notes?: string;
}

/** Request used to fetch or delete one Tag. */
export interface TagIDRequest {
	id: string;
}

export interface GetTagsResponse extends APIResponseData {
	rows: Tag[];
	list: APIList;
}

export interface GetTagResponse extends APIResponseData {
	tag: Tag;
}

export interface CreateTagResponse extends APIResponseData {
	tag: Tag;
}

//
// Tickets
//

/** Fetch one Ticket by its storage ID, with an optional fallback number. */
export interface GetTicketByIDRequest {
	id: string;
	num?: number;
}

/** Fetch one Ticket by its human-facing number. */
export interface GetTicketByNumberRequest {
	id?: never;
	num: number;
}

export type GetTicketRequest = GetTicketByIDRequest | GetTicketByNumberRequest;

/** Common input for fetching several Tickets in request order. */
export interface GetTicketsRequestBase {
	ids: readonly [string, ...string[]];
}

/** Fetch several Tickets without their large body and changes properties. */
export interface GetTicketsRequest extends GetTicketsRequestBase {
	verbose?: false | 0;
}

/** Fetch several complete Tickets, including body and change history. */
export interface GetVerboseTicketsRequest extends GetTicketsRequestBase {
	verbose: true | 1;
}

/** A Ticket returned by non-verbose getTickets mode. */
export interface TicketSummary {
	id: string;
	num: number;
	subject: string;
	body?: never;
	type?: TicketType;
	status: TicketStatus;
	category?: string;
	server?: string;
	assignees: string[];
	cc: string[];
	notify: string[];
	due: number;
	tags: string[];
	events?: TicketEvent[];
	files?: File[];
	changes?: never;
	username: string;
	created: number;
	modified: number;
	err?: never;
	[key: string]: unknown;
}

/** Per-item failure returned by getTickets without failing the whole request. */
export interface TicketLookupError {
	err: APIError | APIRequestData;
	id?: never;
}

/** Due dates accept an absolute Unix timestamp or a relative duration string. */
export type TicketDueInput = number | string;

/** User-supplied Ticket properties shared by normal and templated creation. */
export interface CreateTicketBaseRequest {
	/** Optional custom ID. xyOps generates one when omitted. */
	id?: string;
	subject: string;
	body?: string;
	type?: TicketType;
	status?: TicketStatus;
	category?: string;
	server?: string;
	assignees?: string[];
	cc?: string[];
	notify?: string[];
	due?: TicketDueInput;
	tags?: string[];
	events?: TicketEvent[];
	files?: File[];
	/** Optional author override accepted by the endpoint. */
	username?: string;
}

/** Create a Ticket using explicitly supplied Markdown content. */
export interface CreatePlainTicketRequest extends CreateTicketBaseRequest {
	template?: never;
	job?: never;
	alert?: never;
}

/** Create a Ticket body from an existing Job. */
export interface CreateJobTicketRequest extends CreateTicketBaseRequest {
	template: 'job';
	job: string;
	alert?: never;
}

/** Create a Ticket body from an Alert invocation. */
export interface CreateAlertTicketRequest extends CreateTicketBaseRequest {
	template: 'alert';
	alert: string;
	job?: never;
}

export type CreateTicketRequest =
	| CreatePlainTicketRequest
	| CreateJobTicketRequest
	| CreateAlertTicketRequest;

/** Sparse Ticket fields accepted by updateTicket. */
export interface UpdateTicketRequest {
	id: string;
	subject?: string;
	body?: string;
	type?: TicketType;
	status?: TicketStatus;
	category?: string;
	server?: string;
	assignees?: string[];
	cc?: string[];
	notify?: string[];
	due?: TicketDueInput;
	tags?: string[];
	events?: TicketEvent[];
	files?: File[];
}

/** User-supplied fields for a new Ticket change or comment. */
export interface CreateTicketChange {
	type: 'change' | 'comment';
	key?: string;
	value?: unknown;
	body?: string;
}

/** Add one new change or comment to a Ticket. */
export interface AddTicketChangeRequest {
	id: string;
	change: CreateTicketChange;
}

/** User-editable fields on an existing Ticket change. */
export interface EditTicketChange {
	type?: 'change' | 'comment';
	key?: string;
	value?: unknown;
	body?: string;
}

/** Edit an existing Ticket change or comment. */
export interface EditTicketChangeRequest {
	id: string;
	change_id: string;
	change: EditTicketChange;
	delete?: false;
}

/** Delete an existing Ticket change or comment. */
export interface DeleteTicketChangeRequest {
	id: string;
	change_id: string;
	delete: true;
	change?: never;
}

export type UpdateTicketChangeRequest = EditTicketChangeRequest | DeleteTicketChangeRequest;

/** Upload one or more files for a Ticket body or attachment list. */
export interface UploadUserTicketFilesRequest {
	ticket: string;
	/** Attach files to the Ticket. Otherwise they remain body-editor uploads. */
	save?: boolean;
}

/** Delete one stored file from a Ticket. */
export interface DeleteTicketFileRequest {
	id: string;
	path: string;
}

/** Request used to delete one Ticket. */
export interface TicketIDRequest {
	id: string;
}

export interface GetTicketResponse extends APIResponseData {
	ticket: Ticket;
}

export interface GetTicketsResponse extends APIResponseData {
	tickets: Array<TicketSummary | TicketLookupError>;
}

export interface GetVerboseTicketsResponse extends APIResponseData {
	tickets: Array<Ticket | TicketLookupError>;
}

/** Shared response for Ticket creation, updates, and change operations. */
export interface TicketResponse extends APIResponseData {
	ticket: Ticket;
}

export interface TicketFilesResponse extends APIResponseData {
	/** Complete attachment list when save is true; otherwise only new uploads. */
	files: File[];
}

//
// Web Hooks
//

/** One HTTP request header attached to a Web Hook. */
export interface WebHookHeader {
	name: string;
	value: string;
}

/** Common HTTP methods offered by the Web Hook editor, with custom methods allowed. */
export type WebHookMethod =
	| 'GET'
	| 'HEAD'
	| 'POST'
	| 'PUT'
	| 'PATCH'
	| 'DELETE'
	| 'OPTIONS'
	| (string & {});

/** A stored outbound xyOps Web Hook definition. */
export interface WebHook {
	id: string;
	title: string;
	enabled?: boolean;
	icon?: string;
	url: string;
	method: WebHookMethod;
	headers?: WebHookHeader[];
	body?: string;
	timeout?: number;
	retries?: number;
	follow?: boolean;
	ssl_cert_bypass?: boolean;
	max_per_day?: number;
	notes?: string;
	username: string;
	modified: number;
	created: number;
	/** Present on API-created or subsequently updated Web Hooks. */
	revision?: number;
	[key: string]: unknown;
}

/** Properties accepted when creating a Web Hook. */
export interface CreateWebHookRequest {
	/** Optional custom ID. xyOps generates one when omitted. */
	id?: string;
	title: string;
	url: string;
	method: WebHookMethod;
	enabled?: boolean;
	icon?: string;
	headers?: WebHookHeader[];
	body?: string;
	timeout?: number;
	retries?: number;
	follow?: boolean;
	ssl_cert_bypass?: boolean;
	max_per_day?: number;
	notes?: string;
}

/** Sparse Web Hook fields accepted by updateWebHook. */
export interface UpdateWebHookRequest {
	id: string;
	title?: string;
	url?: string;
	method?: WebHookMethod;
	enabled?: boolean;
	icon?: string;
	headers?: WebHookHeader[];
	body?: string;
	timeout?: number;
	retries?: number;
	follow?: boolean;
	ssl_cert_bypass?: boolean;
	max_per_day?: number;
	notes?: string;
}

/** Request used to fetch or delete one Web Hook. */
export interface WebHookIDRequest {
	id: string;
}

/** Complete Web Hook configuration required by the test endpoint. */
export interface TestWebHookRequest extends Omit<CreateWebHookRequest, 'id'> {
	id: string;
}

/** Markdown report returned after a Web Hook test request completes. */
export interface WebHookTestResult {
	code: number | string;
	description: string;
	details: string;
}

export interface GetWebHooksResponse extends APIResponseData {
	rows: WebHook[];
	list: APIList;
}

export interface WebHookResponse extends APIResponseData {
	web_hook: WebHook;
}

export interface TestWebHookResponse extends APIResponseData {
	result: WebHookTestResult;
}

//
// Email
//

/** Custom MIME headers accepted by sendEmail. */
export type EmailHeaders = Record<string, string>;

/** Compose and send one custom email. */
export interface SendEmailRequest {
	/** One or more comma-separated recipient addresses. */
	to: string;
	subject: string;
	/** Markdown, HTML, or plain text according to the server email format. */
	body: string;
	/** Optional comma-separated carbon-copy addresses. */
	cc?: string;
	/** Optional comma-separated blind-carbon-copy addresses. */
	bcc?: string;
	/** Large heading used by the HTML email template. */
	title?: string;
	/** HTML-template button in LABEL | URL format. */
	button?: string;
	headers?: EmailHeaders;
}

/** Mail delivery result and sanitized SMTP debug transcript. */
export interface SendEmailResponse extends APIResponseData {
	code: number | string;
	description: string;
	details: string;
}

/** Public xyOps API client. */
export interface API {
	/** Throw request setup and transport errors instead of returning err. */
	throw: boolean;

	/** Reinitialize the underlying HTTP client from environment variables. */
	init(): void;

	/** Send a method name directly through the low-level API client. */
	sendRequest<T extends APIResponseData = APIResponseData>(
		method: string,
		request?: APIRequestData,
		options?: APIRequestOptions
	): Promise<APIResponse<T> | { err: APIError }>;

	/** Convert a local setup or transport error using the configured throw mode. */
	doError(error: unknown): { err: APIError };

	getAlerts(request?: APIRequestData, options?: APIRequestOptions): Promise<APIResponse<GetAlertsResponse>>;
	getAlert(request: AlertIDRequest, options?: APIRequestOptions): Promise<APIResponse<GetAlertResponse>>;
	createAlert(request: CreateAlertRequest, options?: APIRequestOptions): Promise<APIResponse<CreateAlertResponse>>;
	updateAlert(request: UpdateAlertRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	testAlert(request: TestAlertRequest, options?: APIRequestOptions): Promise<APIResponse<TestAlertResponse>>;
	deleteAlert(request: AlertIDRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	getAlertInvocations(request: GetAlertInvocationsRequest, options?: APIRequestOptions): Promise<APIResponse<GetAlertInvocationsResponse>>;
	manageAlertInvocationTickets(request: ManageAlertInvocationTicketsRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	deleteAlertInvocation(request: AlertInvocationIDRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;

	getBuckets(request?: APIRequestData, options?: APIRequestOptions): Promise<APIResponse<GetBucketsResponse>>;
	getBucket(request: BucketIDRequest, options?: APIRequestOptions): Promise<APIResponse<GetBucketResponse>>;
	createBucket(request: CreateBucketRequest, options?: APIRequestOptions): Promise<APIResponse<CreateBucketResponse>>;
	updateBucket(request: UpdateBucketRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	deleteBucket(request: BucketIDRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	writeBucketData(request: WriteBucketDataRequest, options?: APIRequestOptions): Promise<APIResponse<WriteBucketDataResponse>>;
	uploadBucketFiles(request: BucketIDRequest, options: APIUploadOptions): Promise<APIResponse<UploadBucketFilesResponse>>;
	deleteBucketFile(request: DeleteBucketFileRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	emptyBucket(request: EmptyBucketRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;

	getCategories(request?: APIRequestData, options?: APIRequestOptions): Promise<APIResponse<GetCategoriesResponse>>;
	getCategory(request: CategoryIDRequest, options?: APIRequestOptions): Promise<APIResponse<GetCategoryResponse>>;
	createCategory(request: CreateCategoryRequest, options?: APIRequestOptions): Promise<APIResponse<CreateCategoryResponse>>;
	updateCategory(request: UpdateCategoryRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	deleteCategory(request: CategoryIDRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	multiUpdateCategory(request: MultiUpdateCategoryRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;

	getChannels(request?: APIRequestData, options?: APIRequestOptions): Promise<APIResponse<GetChannelsResponse>>;
	getChannel(request: ChannelIDRequest, options?: APIRequestOptions): Promise<APIResponse<GetChannelResponse>>;
	createChannel(request: CreateChannelRequest, options?: APIRequestOptions): Promise<APIResponse<CreateChannelResponse>>;
	updateChannel(request: UpdateChannelRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	deleteChannel(request: ChannelIDRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;

	getEvents(request?: GetEventsRequest, options?: APIRequestOptions): Promise<APIResponse<GetEventsResponse>>;
	getEvent(request: EventIDRequest, options?: APIRequestOptions): Promise<APIResponse<GetEventResponse>>;
	getEventHistory(request: GetEventHistoryRequest, options?: APIRequestOptions): Promise<APIResponse<GetEventHistoryResponse>>;
	createEvent(request: CreateEventRequest, options?: APIRequestOptions): Promise<APIResponse<EventResponse>>;
	updateEvent(request: UpdateEventRequest, options?: APIRequestOptions): Promise<APIResponse<EventResponse>>;
	deleteEvent(request: DeleteEventRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	runEvent(request: RunEventRequest, options?: APIUploadOptions): Promise<APIResponse<RunEventResponse>>;

	uploadFiles(request: UploadFilesRequest, options: APIRequiredUploadOptions): Promise<APIResponse<UploadFilesResponse>>;
	uploadJobFile(request: UploadJobFileRequest, options: APISingleUploadOptions): Promise<APIResponse<UploadJobFileResponse>>;
	deleteJobFile(request: DeleteJobFileRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	uploadJobInputFiles(request: UploadJobInputFilesRequest, options: APIRequiredUploadOptions): Promise<APIResponse<UploadJobInputFilesResponse>>;

	getGroups(request?: APIRequestData, options?: APIRequestOptions): Promise<APIResponse<GetGroupsResponse>>;
	getGroup(request: GroupIDRequest, options?: APIRequestOptions): Promise<APIResponse<GetGroupResponse>>;
	createGroup(request: CreateGroupRequest, options?: APIRequestOptions): Promise<APIResponse<CreateGroupResponse>>;
	updateGroup(request: UpdateGroupRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	deleteGroup(request: GroupIDRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	multiUpdateGroup(request: MultiUpdateGroupRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	watchGroup(request: WatchGroupRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	createGroupSnapshot(request: CreateGroupSnapshotRequest, options?: APIRequestOptions): Promise<APIResponse<CreateGroupSnapshotResponse>>;

	getActiveJobs(request?: GetActiveJobsRequest, options?: APIRequestOptions): Promise<APIResponse<GetActiveJobsResponse>>;
	getActiveJobSummary(request?: ActiveJobFilterRequest, options?: APIRequestOptions): Promise<APIResponse<GetActiveJobSummaryResponse>>;
	getWorkflowJobSummary(request?: ActiveJobFilterRequest, options?: APIRequestOptions): Promise<APIResponse<GetWorkflowJobSummaryResponse>>;
	getJob(request: GetJobRequest, options?: APIRequestOptions): Promise<APIResponse<GetJobResponse>>;
	getJobs(request: GetJobsRequest, options?: APIRequestOptions): Promise<APIResponse<GetJobsResponse>>;
	getJobLog(request: JobIDRequest, options: APIDownloadOptions): Promise<APIRawResponse>;
	tailLiveJobLog(request: TailLiveJobLogRequest, options?: APIRequestOptions): Promise<APIResponse<TailLiveJobLogResponse>>;
	streamJob(request: StreamJobRequest, iterator: JobStreamIterator): Promise<APIRawResponse>;
	streamJob(request: StreamJobRequest, options: JobStreamOptions): Promise<APIRawResponse>;
	updateJob(request: UpdateJobRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	resumeJob(request: ResumeJobRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	jobSkipDelay(request: JobIDRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	jobToggleNotifyMe(request: JobIDRequest, options?: APIRequestOptions): Promise<APIResponse<JobToggleNotifyMeResponse>>;
	manageJobTags(request: ManageJobTagsRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	manageJobTickets(request: ManageJobTicketsRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	abortJob(request: JobIDRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	deleteJob(request: JobIDRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	flushEventQueue(request: FlushEventQueueRequest, options?: APIRequestOptions): Promise<APIResponse<FlushEventQueueResponse>>;

	getMonitors(request?: APIRequestData, options?: APIRequestOptions): Promise<APIResponse<GetMonitorsResponse>>;
	getMonitor(request: MonitorIDRequest, options?: APIRequestOptions): Promise<APIResponse<GetMonitorResponse>>;
	createMonitor(request: CreateMonitorRequest, options?: APIRequestOptions): Promise<APIResponse<CreateMonitorResponse>>;
	updateMonitor(request: UpdateMonitorRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	testMonitor(request: TestMonitorRequest, options?: APIRequestOptions): Promise<APIResponse<TestMonitorResponse>>;
	deleteMonitor(request: MonitorIDRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	multiUpdateMonitor(request: MultiUpdateMonitorRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	getQuickmonData(request?: GetQuickmonDataRequest, options?: APIRequestOptions): Promise<APIResponse<GetQuickmonDataResponse>>;
	getLatestMonitorData(request: GetLatestMonitorDataRequest, options?: APIRequestOptions): Promise<APIResponse<GetLatestMonitorDataResponse>>;
	getHistoricalMonitorData(request: GetHistoricalMonitorDataRequest, options?: APIRequestOptions): Promise<APIResponse<GetHistoricalMonitorDataResponse>>;

	getPlugins(request?: APIRequestData, options?: APIRequestOptions): Promise<APIResponse<GetPluginsResponse>>;
	getPlugin(request: PluginIDRequest, options?: APIRequestOptions): Promise<APIResponse<GetPluginResponse>>;
	createPlugin(request: CreatePluginRequest, options?: APIRequestOptions): Promise<APIResponse<PluginResponse>>;
	updatePlugin(request: UpdatePluginRequest, options?: APIRequestOptions): Promise<APIResponse<PluginResponse>>;
	testMonitorPlugin(request: TestMonitorPluginRequest, options?: APIRequestOptions): Promise<APIResponse<TestMonitorPluginResponse>>;
	testSchedulerPlugin(request: TestSchedulerPluginRequest, options?: APIRequestOptions): Promise<APIResponse<TestSchedulerPluginResponse>>;
	deletePlugin(request: PluginIDRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;

	getRoles(request?: APIRequestData, options?: APIRequestOptions): Promise<APIResponse<GetRolesResponse>>;
	getRole(request: RoleIDRequest, options?: APIRequestOptions): Promise<APIResponse<GetRoleResponse>>;
	createRole(request: CreateRoleRequest, options?: APIRequestOptions): Promise<APIResponse<CreateRoleResponse>>;
	updateRole(request: UpdateRoleRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	deleteRole(request: RoleIDRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;

	searchJobs<T = Partial<JobRecord>>(request: SearchJobsSelectRequest, options?: APIRequestOptions): Promise<APIResponse<SearchJobsResponse<T>>>;
	searchJobs(request?: SearchJobsRequest, options?: APIRequestOptions): Promise<APIResponse<SearchJobsResponse>>;
	searchServers(request?: SearchRequest, options?: APIRequestOptions): Promise<APIResponse<SearchServersResponse>>;
	searchAlerts(request?: SearchRequest, options?: APIRequestOptions): Promise<APIResponse<SearchAlertsResponse>>;
	searchSnapshots(request?: SearchSnapshotsRequest, options?: APIRequestOptions): Promise<APIResponse<SearchSnapshotsResponse>>;
	searchTickets(request: SearchCompactTicketsRequest, options?: APIRequestOptions): Promise<APIResponse<SearchCompactTicketsResponse>>;
	searchTickets(request?: SearchTicketsRequest, options?: APIRequestOptions): Promise<APIResponse<SearchTicketsResponse>>;
	searchActivity(request?: SearchRequest, options?: APIRequestOptions): Promise<APIResponse<SearchActivityResponse>>;
	searchRevisionHistory(request: SearchRevisionHistoryRequest, options?: APIRequestOptions): Promise<APIResponse<SearchRevisionHistoryResponse>>;
	searchStatHistory<T = unknown>(request?: SearchStatHistoryRequest, options?: APIRequestOptions): Promise<APIResponse<SearchStatHistoryResponse<T>>>;

	marketplace(request: MarketplaceFieldsRequest, options?: APIRequestOptions): Promise<APIResponse<MarketplaceFieldsResponse>>;
	marketplace(request: MarketplaceReadmeRequest, options?: APIRequestOptions): Promise<APIResponse<MarketplaceReadmeResponse>>;
	marketplace<T = MarketplacePluginData>(request: MarketplaceDataRequest, options?: APIRequestOptions): Promise<APIResponse<MarketplaceDataResponse<T>>>;
	marketplace(request?: MarketplaceSearchRequest, options?: APIRequestOptions): Promise<APIResponse<MarketplaceSearchResponse>>;

	getSecrets(request?: APIRequestData, options?: APIRequestOptions): Promise<APIResponse<GetSecretsResponse>>;
	getSecret(request: SecretIDRequest, options?: APIRequestOptions): Promise<APIResponse<GetSecretResponse>>;
	decryptSecret(request: SecretIDRequest, options?: APIRequestOptions): Promise<APIResponse<DecryptSecretResponse>>;
	createSecret(request: CreateSecretRequest, options?: APIRequestOptions): Promise<APIResponse<CreateSecretResponse>>;
	updateSecret(request: UpdateSecretRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	deleteSecret(request: SecretIDRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;

	getServerSummaries(request?: APIRequestData, options?: APIRequestOptions): Promise<APIResponse<GetServerSummariesResponse>>;
	getActiveServers(request?: APIRequestData, options?: APIRequestOptions): Promise<APIResponse<GetActiveServersResponse>>;
	getActiveServer(request: ServerIDRequest, options?: APIRequestOptions): Promise<APIResponse<GetActiveServerResponse>>;
	getServer(request: ServerIDRequest, options?: APIRequestOptions): Promise<APIResponse<GetServerResponse>>;
	updateServer(request: UpdateServerRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	updateServerData(request: UpdateServerDataRequest, options?: APIRequestOptions): Promise<APIResponse<UpdateServerDataResponse>>;
	deleteServer(request: DeleteServerRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	watchServer(request: WatchServerRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	createSnapshot(request: CreateSnapshotRequest, options?: APIRequestOptions): Promise<APIResponse<CreateSnapshotResponse>>;
	deleteSnapshot(request: SnapshotIDRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;

	getTags(request?: APIRequestData, options?: APIRequestOptions): Promise<APIResponse<GetTagsResponse>>;
	getTag(request: TagIDRequest, options?: APIRequestOptions): Promise<APIResponse<GetTagResponse>>;
	createTag(request: CreateTagRequest, options?: APIRequestOptions): Promise<APIResponse<CreateTagResponse>>;
	updateTag(request: UpdateTagRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	deleteTag(request: TagIDRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;

	getTicket(request: GetTicketRequest, options?: APIRequestOptions): Promise<APIResponse<GetTicketResponse>>;
	getTickets(request: GetVerboseTicketsRequest, options?: APIRequestOptions): Promise<APIResponse<GetVerboseTicketsResponse>>;
	getTickets(request: GetTicketsRequest, options?: APIRequestOptions): Promise<APIResponse<GetTicketsResponse>>;
	createTicket(request: CreateTicketRequest, options?: APIUploadOptions): Promise<APIResponse<TicketResponse>>;
	updateTicket(request: UpdateTicketRequest, options?: APIRequestOptions): Promise<APIResponse<TicketResponse>>;
	addTicketChange(request: AddTicketChangeRequest, options?: APIRequestOptions): Promise<APIResponse<TicketResponse>>;
	updateTicketChange(request: UpdateTicketChangeRequest, options?: APIRequestOptions): Promise<APIResponse<TicketResponse>>;
	uploadUserTicketFiles(request: UploadUserTicketFilesRequest, options: APIRequiredUploadOptions): Promise<APIResponse<TicketFilesResponse>>;
	deleteTicketFile(request: DeleteTicketFileRequest, options?: APIRequestOptions): Promise<APIResponse<TicketFilesResponse>>;
	deleteTicket(request: TicketIDRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;

	getWebHooks(request?: APIRequestData, options?: APIRequestOptions): Promise<APIResponse<GetWebHooksResponse>>;
	getWebHook(request: WebHookIDRequest, options?: APIRequestOptions): Promise<APIResponse<WebHookResponse>>;
	createWebHook(request: CreateWebHookRequest, options?: APIRequestOptions): Promise<APIResponse<WebHookResponse>>;
	updateWebHook(request: UpdateWebHookRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	deleteWebHook(request: WebHookIDRequest, options?: APIRequestOptions): Promise<APIResponse<APIResponseData>>;
	testWebHook(request: TestWebHookRequest, options?: APIRequestOptions): Promise<APIResponse<TestWebHookResponse>>;

	sendEmail(request: SendEmailRequest, options?: APIUploadOptions): Promise<APIResponse<SendEmailResponse>>;

	/** Additional proxy endpoints outside the SDK catalog remain callable. */
	[method: string]: any;
}

/** xyOps API client exported by the package. */
export const api: API;
