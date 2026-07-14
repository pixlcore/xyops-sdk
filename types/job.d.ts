/**
 * A freeform map used for job parameters, input data, workflow data, and
 * server data. Values originate in JSON, but callers may narrow them with the
 * generic getter methods when they know the expected shape.
 */
export interface JobDataMap {
	[key: string]: unknown;
}

/** Event Plugin parameter values keyed by parameter ID. */
export interface JobParams extends JobDataMap {}

/** Decrypted Secret Vault values keyed by variable name. */
export interface JobSecrets {
	[key: string]: string | undefined;
}

/** Environment variables supplied to the job process. */
export interface JobEnvironment {
	[key: string]: string | undefined;
}

/** Metadata for a file supplied to the job as input or stored on a job. */
export interface JobFile {
	/** Unique xyOps file ID. */
	id: string;
	/** Original filename, which is also used for the local downloaded file. */
	filename: string;
	/** File size in bytes. */
	size: number;
	/** Unix timestamp indicating when the file was created. */
	date?: number;
	/** User who uploaded the file, when applicable. */
	username?: string;
	/** Internal storage path, when present on a completed job. */
	path?: string;
	/** Server ID associated with the file, when applicable. */
	server?: string;
	/** Job ID associated with the file, when applicable. */
	job?: string;
	[key: string]: unknown;
}

/** Object form accepted when attaching an output file. */
export interface JobFileSpecObject {
	/** Local file path or glob pattern. */
	path: string;
	/** Optional destination filename. Do not combine this with a glob path. */
	filename?: string;
	/** Delete the local file after xyOps uploads it. */
	delete?: boolean;
}

/**
 * A file attachment can be a path, a path and destination filename tuple, or
 * an object with named options.
 */
export type JobFileSpec =
	| string
	| readonly [path: string, filename: string]
	| readonly [path: string, filename: string, deleteAfterUpload: true]
	| JobFileSpecObject;

/** Files and freeform data passed into a job. */
export interface JobInput {
	data: JobDataMap;
	files: JobFile[];
}

/** Definition for a user-supplied field shown when manually starting a job. */
export interface JobField {
	id: string;
	title: string;
	type: 'text' | 'textarea' | 'code' | 'json' | 'checkbox' | 'select' | 'bucket' | 'system' | 'hidden' | 'toolset' | 'group' | (string & {});
	variant?: 'color' | 'date' | 'datetime-local' | 'email' | 'number' | 'text' | 'time' | 'tel' | 'url' | (string & {});
	value?: unknown;
	data?: JobDataMap;
	caption?: string;
	required?: boolean;
	locked?: boolean;
	[key: string]: unknown;
}

/** Conditions supported by saved and dynamically-added job actions. */
export type JobActionCondition =
	| 'start'
	| 'complete'
	| 'success'
	| 'error'
	| 'user'
	| 'warning'
	| 'critical'
	| 'abort'
	| 'instant'
	| 'alert_new'
	| 'alert_cleared'
	| `tag:${string}`;

/** Built-in action types. Plugins may add custom type-specific properties. */
export type JobActionType =
	| 'email'
	| 'web_hook'
	| 'run_event'
	| 'channel'
	| 'disable'
	| 'delete'
	| 'snapshot'
	| 'suspend'
	| 'tag'
	| 'label'
	| 'store'
	| 'fetch'
	| 'ticket'
	| 'plugin'
	| (string & {});

/** An action attached to a job or added while the job is running. */
export interface JobAction {
	enabled: boolean;
	condition: JobActionCondition;
	type: JobActionType;
	email?: string;
	url?: string;
	event_id?: string;
	channel_id?: string;
	plugin_id?: string;
	params?: JobDataMap;
	users?: string[];
	tags?: string[];
	label?: string;
	[key: string]: unknown;
}

/** Resource limit types supported by xyOps jobs. */
export type JobLimitType = 'time' | 'job' | 'log' | 'mem' | 'cpu' | 'retry' | 'queue' | 'file' | 'day' | 'tag';

/** A resource limit inherited from the Event or its Category. */
export interface JobLimit {
	enabled: boolean;
	type: JobLimitType;
	amount?: number;
	duration?: number;
	condition?: string;
	tags?: string[];
	users?: string[];
	email?: string;
	web_hook?: string;
	text?: string;
	snapshot?: boolean;
	abort?: boolean;
	[key: string]: unknown;
}

/** Workflow graph node included with workflow jobs. */
export interface JobWorkflowNode {
	id: string;
	type: 'event' | 'job' | 'trigger' | 'limit' | 'action' | 'controller' | 'note';
	data?: JobDataMap;
	x?: number;
	y?: number;
	[key: string]: unknown;
}

/** Connection between two workflow graph nodes. */
export interface JobWorkflowConnection {
	id: string;
	source: string;
	dest: string;
	condition?: JobActionCondition;
	[key: string]: unknown;
}

/** Runtime timestamps and other state stored for one workflow node. */
export interface JobWorkflowNodeState {
	started?: number;
	completed?: number;
	[key: string]: unknown;
}

/** A completed sub-job summary stored under JobWorkflow.jobs. */
export interface JobWorkflowJob {
	id: string;
	code?: JobCode;
	description?: string;
	server?: string;
	completed?: number;
	elapsed?: number;
	tags?: string[];
	files?: JobFile[];
	replay?: boolean;
	[key: string]: unknown;
}

/** Runtime workflow context attached to a workflow or workflow sub-job. */
export interface JobWorkflow {
	nodes?: JobWorkflowNode[];
	connections?: JobWorkflowConnection[];
	start?: string;
	state?: Record<string, JobWorkflowNodeState>;
	jobs?: Record<string, JobWorkflowJob[]>;
	/** Parent workflow Job ID, when this is a sub-job. */
	job?: string;
	/** Parent workflow Event ID, when this is a sub-job. */
	event?: string;
	/** Workflow node which started this sub-job. */
	node?: string;
	/** Controller node governing this sub-job. */
	launcher?: string;
	/** Parameters supplied when the workflow was launched. */
	params?: JobParams;
	/** Original scheduled time for the parent workflow. */
	now?: number;
	[key: string]: unknown;
}

/** Information about the job which launched the current job. */
export interface JobParent {
	job: string;
	event: string;
	code: JobCode;
	description: string;
}

/** A job launched by the current job because of an action or retry. */
export interface JobChild {
	id: string;
	reason: 'action' | 'retry';
}

/** User-defined table shown on the Job Details page. */
export interface JobTable {
	title?: string;
	header: string[];
	rows: unknown[][];
	caption?: string;
}

/** User-defined HTML, Markdown, or plain text shown on the Job Details page. */
export interface JobContent {
	title?: string;
	content: string;
	caption?: string;
}

/** Persistent and per-row values accepted by pixl-logger. */
export interface JobLoggerArguments {
	[key: string]: unknown;
	debugLevel?: number;
	hostname?: string;
	pid?: number;
	event?: string;
	job?: string;
	category?: string;
	code?: JobCode;
	msg?: string;
	data?: unknown;
	sync?: boolean;
	echo?: boolean;
	color?: boolean;
	now?: number;
}

/** Callback used by pixl-logger rotation and archive operations. */
export type JobLoggerCallback = (error?: Error | null) => void;

/** Override the destination path for each log row. */
export type JobLoggerPather = (path: string, args: JobLoggerArguments) => string;

/** Clean or transform one column before serialization. */
export type JobLoggerFilter = (value: unknown, index: number) => string;

/** Serialize one complete log row, or return false to skip the row. */
export type JobLoggerSerializer = (columns: string[], args: JobLoggerArguments) => string | false;

/** Customize how a row is echoed when echo mode is enabled. */
export type JobLoggerEchoer = (line: string, columns: string[], args: JobLoggerArguments) => void;

/** The pixl-logger instance initialized when job.read() completes. */
export interface JobLogger {
	/** Current path. Logs written to the initial xyOps path are attached automatically. */
	path: string;
	/** Ordered columns included in each log row. */
	columns: string[];
	/** Persistent values merged into each call to print(). */
	args: JobLoggerArguments;

	columnColors: string[];
	dividerColor: string;
	pather: JobLoggerPather | null;
	filter: JobLoggerFilter | null;
	serializer: JobLoggerSerializer | null;
	echoer: JobLoggerEchoer | string | null;
	useBuffer: boolean;
	bufferMaxLines: number;
	flushInterval: number;
	flushOnShutdown: boolean;
	approximateTime: boolean;
	lastRow?: string;
	lastPath?: string;

	/** Enable batched log writes. Call shutdown() before completing the job. */
	enableBuffer(): void;
	/** Append one already-serialized line to the current buffer. */
	bufferAppendLine(line: string): void;
	/** Flush pending buffered rows to disk. */
	flushBuffer(): void;
	/** Flush buffered rows, clear the timer, and return to synchronous mode. */
	shutdown(): void;

	/** Return all persistent logger arguments. */
	get(): JobLoggerArguments;
	/** Return one persistent logger argument. */
	get<T = unknown>(key: string): T | undefined;
	/** Set one persistent logger argument or logger option. */
	set(key: string, value: unknown): void;
	/** Set multiple persistent logger arguments or logger options. */
	set(args: JobLoggerArguments): void;
	/** Create an independent logger with the same configuration. */
	clone(args?: JobLoggerArguments): JobLogger;
	/** Write one log row using named column values. */
	print(args: JobLoggerArguments): void;
	/** Format filtered columns for colored terminal output. */
	colorize(columns: string[]): string;

	/** Write a debug row when level is no higher than debugLevel. */
	debug(level: number, message: string, data?: unknown): void;
	/** Write an error row. */
	error(code: JobCode, message: string, data?: unknown): void;
	/** Write a transaction row. */
	transaction(code: JobCode, message: string, data?: unknown): void;
	/** Return whether a debug level is currently enabled. */
	shouldLog(level: number): boolean;

	/** Atomically rotate the current log file. */
	rotate(destinationPath: string, callback: JobLoggerCallback): void;
	/** Atomically rotate another log file. */
	rotate(sourcePath: string, destinationPath: string, callback: JobLoggerCallback): void;
	/** Archive matching log files, optionally compressing destinations ending in .gz. */
	archive(sourcePattern: string | null | undefined, destinationPath: string, epoch: number, callback?: JobLoggerCallback): void;

	/** Subscribe to a serialized row after it is written. */
	on(event: 'row', listener: (line: string, columns: string[], args: JobLoggerArguments) => void): this;
	/** Subscribe to a completed buffer flush. */
	on(event: 'bufferFlushed', listener: (payload: string) => void): this;
	/** Subscribe to another EventEmitter event. */
	on(event: string, listener: (...args: any[]) => void): this;
	/** Subscribe once to an EventEmitter event. */
	once(event: string, listener: (...args: any[]) => void): this;
	/** Remove an EventEmitter listener. */
	removeListener(event: string, listener: (...args: any[]) => void): this;
	/** Emit an EventEmitter event. */
	emit(event: string, ...args: any[]): boolean;
}

/** JSON-friendly performance summary produced by pixl-perf. */
export interface JobPerformanceMetrics {
	/** Time scale relative to one second. The SDK default of 1 reports seconds. */
	scale: number;
	/** Cumulative elapsed time for each completed named metric, plus the total. */
	perf: Record<string, number>;
	/** Cumulative values for arbitrary counters. */
	counters: Record<string, number>;
}

/** One independent measurement returned by JobPerformanceTracker.begin(). */
export interface JobPerformanceMetric {
	/** Finish this specific measurement and return its elapsed time. */
	end(): number | undefined;
}

/** One raw timing record stored internally by pixl-perf. */
export interface JobPerformanceTiming {
	start?: [number, number];
	end?: [number, number] | number;
	elapsed: number;
	min?: number;
	max?: number;
	count?: number;
}

/** Minimum, average, maximum, total, and count for one named metric. */
export interface JobPerformanceMinMaxMetric {
	min: number;
	max: number;
	total: number;
	count: number;
	avg: number;
}

/** The pixl-perf tracker initialized when job.read() completes. */
export interface JobPerformanceTracker {
	/** Current time scale relative to one second. The SDK initializes this to 1. */
	scale: number;
	/** Current decimal precision multiplier. */
	precision: number;
	/** Property name used for the overall elapsed time. */
	totalKey: string;
	/** Enable minimum, average, and maximum aggregation for repeated metrics. */
	minMax: boolean;

	/** Begin an independent named measurement. */
	begin(id: string): JobPerformanceMetric;
	/** Begin overall tracking. The SDK already does this during job.read(). */
	begin(): JobPerformanceMetric | undefined;
	/** End a named measurement, or the overall measurement when omitted. */
	end(id?: string): number | undefined;
	/** Increment or decrement an arbitrary counter. The amount defaults to 1. */
	count(id: string, amount?: number): void;
	/** Return a JSON-friendly summary of all completed metrics and counters. */
	metrics(): JobPerformanceMetrics;
	/** Return the current performance summary serialized as JSON. */
	json(): string;
	/** Return a flattened ampersand-delimited summary. */
	summarize(prefix?: string): string;
	/** Reset all timings and counters while preserving scale and precision. */
	reset(): void;
	/** Change the time scale. Use 1 for seconds or 1000 for milliseconds. */
	setScale(scale: number): void;
	/** Change the decimal precision multiplier used for elapsed measurements. */
	setPrecision(precision: number): void;
	/** Return the current elapsed value for one metric. */
	elapsed(id?: string, formatted?: boolean): number;
	/** Return the raw internal timing records. */
	get(): Record<string, JobPerformanceTiming>;
	/** Return the raw counter values. */
	getCounters(): Record<string, number>;
	/** Return min/max summaries when minMax mode is enabled. */
	getMinMaxMetrics(): Record<string, JobPerformanceMinMaxMetric>;
	/** Merge metrics and counters from another tracker or summary. */
	import(perf: JobPerformanceTracker | JobPerformanceMetrics, prefix?: string): void;
}

/** Items which may be appended to a running job. */
export interface JobPush {
	actions?: JobAction[];
	limits?: JobLimit[];
	files?: JobFileSpec[];
	tags?: string[];
}

/** Known properties accepted by the low-level job.write() method. */
export interface JobUpdate {
	complete?: boolean;
	code?: JobCode;
	description?: string;
	data?: JobDataMap;
	workflowData?: JobDataMap;
	serverData?: JobDataMap;
	files?: JobFileSpec[];
	push?: JobPush;
	progress?: number;
	status?: string;
	label?: string;
	perf?: JobDataMap | JobPerformanceMetrics;
	table?: JobTable;
	html?: JobContent;
	markdown?: JobContent;
	text?: JobContent;
	update_event?: JobDataMap;
	[key: string]: unknown;
}

/** Job states used from queueing through completion. */
export type JobState = 'queued' | 'start_delay' | 'retry_delay' | 'ready' | 'starting' | 'active' | 'finishing' | 'complete';

/** Built-in sources which may launch a job. */
export type JobSource = 'scheduler' | 'plugin' | 'key' | 'user' | 'action' | 'alert' | 'workflow' | 'magic' | 'startup';

/** A successful, failed, or special xyOps job result code. */
export type JobCode = number | string;

/** Data properties carried by a running or completed xyOps Job. */
export interface JobData {
	/** Allow newer xyOps releases and custom plugins to merge additional fields. */
	[key: string]: unknown;

	/** xyOps Wire Protocol version, normally 1. */
	xy?: number;
	/** Unique Job ID. */
	id?: string;
	/** Job or Event Plugin type. */
	type?: 'event' | 'workflow' | 'adhoc' | (string & {});
	/** Event ID which spawned the job. */
	event?: string;
	/** Category ID inherited from the Event. */
	category?: string;
	/** Event Plugin ID which runs the job. */
	plugin?: string;
	/** Optional Event icon ID. */
	icon?: string;
	/** Event Plugin parameter values. */
	params: JobParams;
	/** User-defined fields collected when manually starting the job. */
	fields?: JobField[];
	/** Tag IDs assigned to the job. */
	tags?: string[];
	/** Server or Group IDs used to target the job. */
	targets?: string[];
	/** Optional target expression. */
	expression?: string;
	/** Server selection algorithm inherited from the Event. */
	algo?: string;
	/** Event notes inherited by the job. */
	notes?: string;
	/** Actions attached to the job. */
	actions?: JobAction[];
	/** Resource limits attached to the job. */
	limits?: JobLimit[];
	/** User who launched or owns the Event. */
	username?: string;
	/** Internal API Key ID when source is key. */
	key?: string;

	/** Server ID selected to run the job. */
	server?: string;
	/** Group IDs assigned to the selected server. */
	groups?: string[];
	/** Executable command copied from the Event Plugin. */
	command?: string;
	/** Script source or script file marker copied from the Event Plugin. */
	script?: string;
	/** User ID used for the job process. */
	uid?: string | number;
	/** Group ID used for the job process. */
	gid?: string | number;
	/** Process termination strategy copied from the Event Plugin. */
	kill?: 'none' | 'parent' | 'all' | (string & {});
	/** Indicates that process and file management are delegated to a runner. */
	runner?: boolean;
	/** Current working directory for the job process. */
	cwd?: string;
	/** Environment variables supplied to the job process. */
	env?: JobEnvironment;

	state?: JobState;
	started?: number;
	updated?: number;
	completed?: number;
	elapsed?: number;
	now?: number;
	code?: JobCode;
	description?: string;
	remote?: boolean;
	until?: number;
	progress?: number;
	status?: string;
	complete?: boolean;
	suspended?: boolean;
	reconnected?: number;
	log_file?: string;
	log_file_size?: number;
	activity?: JobDataMap[];
	source?: JobSource;
	parent?: JobParent;

	/** Data and files supplied by an upstream job, bucket, or trigger. */
	input: JobInput;
	retried?: boolean;
	retry_count?: number;
	retry_prev?: string;
	jobs?: JobChild[];
	cpu?: JobDataMap;
	mem?: JobDataMap;
	disk?: JobDataMap;
	net?: JobDataMap;
	/** Arbitrary output data stored on the job. */
	data?: JobDataMap;
	/** Output file specifications while running, or uploaded file metadata later. */
	files?: Array<JobFileSpec | JobFile>;
	update_event?: JobDataMap;
	push?: JobPush;
	procs?: JobDataMap[];
	conns?: JobDataMap[];
	timelines?: JobDataMap[];
	table?: JobTable;
	html?: JobContent;
	markdown?: JobContent;
	text?: JobContent;
	stype?: string;
	splugin?: string;
	pid?: number;
	rpid?: number;
	label?: string;
	test?: boolean;

	/** Decrypted Secret Vault values. */
	secrets: JobSecrets;
	/** Fully-qualified URL for the current primary conductor. */
	base_url?: string;
	/** Workflow runtime context for workflow jobs and sub-jobs. */
	workflow?: JobWorkflow;
	/** Ticket IDs associated with the job. */
	tickets?: string[];
	/** Queue position when state is queued. */
	position?: number;
	/** Persistent user data copied from the selected server. */
	serverData?: JobDataMap;
	/** User data shared across all jobs in a workflow. */
	workflowData?: JobDataMap;
	invisible?: boolean;
	ephemeral?: boolean;
	/** Component versions available to the running job. */
	versions?: Record<string, string>;
	priority?: boolean;
}


/**
 * The combined xyOps Job data object and Node.js runtime helper interface.
 * Call and await read() before using fields populated from STDIN.
 */
export interface Job extends JobData {
	/** Read the Job JSON document from STDIN and merge it into this object. */
	read(): Promise<void>;
	/** Performance tracker initialized and started by read(). */
	perf: JobPerformanceTracker;
	/** Opt-in pixl-logger instance initialized by read(). */
	logger: JobLogger;
	/** Return a tracker summary only when named metrics or counters were added. */
	getMetrics(): JobPerformanceMetrics | undefined;
	/** Write one raw XYWP update to STDOUT. */
	write(data: JobUpdate): void;
	/** Complete the job successfully. */
	finalSuccess(message?: string): void;
	/** Complete the job with a truthy numeric or string error code. */
	finalError(code?: JobCode, message?: string): void;

	getParams(): JobParams;
	getParam<T = unknown>(key: string): T | undefined;
	getFiles(): JobFile[];
	getData(): JobDataMap;
	getData<T = unknown>(key: string): T | undefined;
	getWorkflowData(): JobDataMap;
	getWorkflowData<T = unknown>(key: string): T | undefined;
	getServerData(): JobDataMap;
	getServerData<T = unknown>(key: string): T | undefined;
	getSecrets(): JobSecrets;
	getSecret(key: string): string | undefined;

	addWorkflowData(workflowData: JobDataMap): void;
	addServerData(serverData: JobDataMap): void;
	addData(data: JobDataMap): void;
	addFile(file: JobFileSpec): void;
	addFiles(files: readonly JobFileSpec[]): void;
	addAction(action: JobAction): void;
	addActions(actions: readonly JobAction[]): void;
	addTag(tag: string): void;
	addTags(tags: readonly string[]): void;

	setTable(title: string, header: readonly string[], rows: readonly (readonly unknown[])[], caption?: string): void;
	setHTML(title: string, content: string, caption?: string): void;
	setText(title: string, content: string, caption?: string): void;
	setMarkdown(title: string, content: string, caption?: string): void;
	setProgress(amount: number): void;
	setStatus(status: string): void;
	setLabel(label: string): void;
}

/** Fully typed Job runtime helper exported by the package. */
export const job: Job;
