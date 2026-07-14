# xyOps SDK for Node.js

The xyOps SDK is a Node.js client library for [xyOps](https://xyops.io), a workflow automation, job scheduling, and server monitoring platform. It provides a friendly JavaScript interface for two common use cases: controlling xyOps remotely through its REST API, and communicating with xyOps from inside a running job.

The package provides two independent interfaces:

- `api` is a wrapper around the xyOps REST API. It handles request formatting, authentication, and response parsing for you. Use it from applications, services, command-line scripts, integrations, or even from inside an xyOps job. See [API Client](#api-client) for details.
- `job` is a runtime toolkit for Node.js code launched by xyOps. It reads the job input, provides access to parameters, data, files, and secrets, and sends progress updates and final results back to xyOps. It handles the JSON-over-STDIO wire protocol for you. See [Job Runtime SDK](#job-runtime-sdk) for details.

You can use either interface by itself, or use both together inside a job. Import them using CommonJS:

```js
const { api, job } = require('@pixlcore/xyops-sdk');
```

Or using ESM:

```js
import { api, job } from '@pixlcore/xyops-sdk';
```

## Installation

```sh
npm install @pixlcore/xyops-sdk
```

## Job Runtime SDK

The `job` interface is designed for a custom Node.js Event Plugin or a Node.js script running through the built-in Shell Plugin. It reads the job document from STDIN and writes newline-delimited XYWP JSON to STDOUT.

### Basic Job

Always call and await [job.read()](#job-read) before accessing job input:

```js
const { api, job } = require('@pixlcore/xyops-sdk');

(async function() {
	await job.read();
	
	let params = job.getParams();
	console.log('My param: ' + params.myparam);
	
	job.finalSuccess('Job successful');
})();
```

If you are developing an ESM module, you can use import syntax with top-level await (with Node.js v22+):

```js
import { api, job } from '@pixlcore/xyops-sdk';

await job.read();

let params = job.getParams();
console.log('My param: ' + params.myparam);

job.finalSuccess('Job successful');
```

Normal output that does not contain XYWP JSON is written to the job log. Every helper update is flushed immediately to STDOUT.

Once you call [job.finalSuccess()](#job-finalsuccess) or [job.finalError()](#job-finalerror), the SDK disables further job updates. Make the final call the last operation in your script.

### Reading Input

#### job.read

Async function which reads all JSON from STDIN and merges the job properties into the `job` object.

```js
await job.read();
console.log(job.id);
```

For more details about what is included, see [Job Input](https://docs.xyops.io/#Docs/plugins/job-input).

#### job.getParams

Returns all Event Plugin parameters.

```js
let params = job.getParams();
console.log(params);
```

#### job.getParam

Returns one Event Plugin parameter by its name.

```js
let mode = job.getParam('mode');
```

#### job.getFiles

Returns the `input.files` metadata array. Input files are already downloaded into the job's current working directory.

```js
let files = job.getFiles();
for (let file of files) console.log(file.filename);
```

For more details, see [Input Files](https://docs.xyops.io/#Docs/plugins/input-files).

#### job.getData

Returns all `input.data`, or one top-level value when you provide a key.

```js
let data = job.getData();
let customerId = job.getData('customer_id');
```

#### job.getWorkflowData

Returns all shared workflow data, or one top-level value. Outside a workflow this returns an empty object or `undefined` for a missing key.

```js
let shared = job.getWorkflowData();
let batchId = job.getWorkflowData('batch_id');
```

For more details, see [Sharing Data Between All Nodes](https://docs.xyops.io/#Docs/workflows/sharing-data-between-all-nodes).

#### job.getServerData

Returns all user data for the current server, or one top-level value.

```js
let serverData = job.getServerData();
let region = job.getServerData('region');
```

For more details, see [Server User Data](https://docs.xyops.io/#Docs/servers/user-data).

#### job.getSecrets

Returns all assigned Secret Vault variables.

```js
let secrets = job.getSecrets();
```

For more details, see [Secrets](https://docs.xyops.io/secrets).

#### job.getSecret

Returns one assigned Secret Vault variable by its name.

```js
let password = job.getSecret('DB_PASSWORD');
```

Do not print secrets to STDOUT or STDERR because ordinary output is captured in the job log.

### Sending Output Data

#### job.addData

Adds freeform output data for downstream jobs. Multiple updates are shallow-merged by xyOps, and top-level arrays are concatenated.

```js
job.addData({ records_processed: 125, result: 'ok' });
```

For more details, see [Output Data](https://docs.xyops.io/#Docs/plugins/output-data).

#### job.addWorkflowData

Adds shared workflow data. xyOps merges it into the parent workflow when this sub-job completes.

```js
job.addWorkflowData({ batch_id: 'batch-2026-07-12' });
```

For more details, see [Workflow Data](https://docs.xyops.io/#Docs/plugins/workflow-data).

#### job.addServerData

Adds persistent user data for the server running the job. xyOps applies the shallow merge when the job completes.

```js
job.addServerData({ last_backup: Date.now() });
```

For more details, see [Server Data](https://docs.xyops.io/#Docs/plugins/server-data).

### Attaching Files

#### job.addFile

Appends one output file path or glob pattern. xyOps uploads the matching files when the job completes and passes them to downstream jobs.

```js
job.addFile('report.csv');
```

For more details, see [Output Files](https://docs.xyops.io/#Docs/plugins/output-files).

#### job.addFiles

Appends multiple output file paths or glob patterns. Each item may also be an object with `path` and `delete` properties.

```js
job.addFiles(['logs/*.log', { path: 'temp/*.json', delete: true }]);
```

For more details, see [Output Files](https://docs.xyops.io/#Docs/plugins/output-files).

### Tags and Actions

#### job.addTag

Appends one Tag ID to the current job.

```js
job.addTag('important');
```

For more details, see [Job Tags](https://docs.xyops.io/#Docs/plugins/job-tags).

#### job.addTags

Appends multiple Tag IDs to the current job.

```js
job.addTags(['nightly', 'backup']);
```

For more details, see [Job Tags](https://docs.xyops.io/#Docs/plugins/job-tags).

#### job.addAction

Appends one job action object. See [Action Types](https://docs.xyops.io/#Docs/actions/action-types) for all supported properties.

```js
job.addAction({
	condition: 'success',
	type: 'run_event',
	event_id: 'EVENT_ID',
	params: {},
	enabled: true
});
```

For more details, see [Job Actions](https://docs.xyops.io/#Docs/plugins/job-actions).

#### job.addActions

Appends multiple job action objects. See [Action Types](https://docs.xyops.io/#Docs/actions/action-types) for all supported properties.

```js
job.addActions([
	{ condition: 'complete', type: 'email', email: 'ops@example.com', users: [], enabled: true }
]);
```

For more details, see [Job Actions](https://docs.xyops.io/#Docs/plugins/job-actions).

### Custom Job Content

These helpers add a custom report to the Job Details page. `caption` is optional in every call.

#### job.setTable

Displays tabular data.

```js
job.setTable(
	'Import Results',
	['File', 'Rows'],
	[['customers.csv', 250], ['orders.csv', 840]],
	'Rows imported by file'
);
```

For more details, see [Custom Content](https://docs.xyops.io/#Docs/plugins/custom-content).

#### job.setHTML

Displays sanitized HTML. xyOps removes elements and attributes that are not allowed by its sanitization configuration.

```js
job.setHTML('Summary', '<b>Backup complete</b>', 'Generated by the backup job');
```

For more details, see [Custom Content](https://docs.xyops.io/#Docs/plugins/custom-content).

#### job.setText

Displays plain text while preserving whitespace.

```js
job.setText('Command Output', 'Processed: 125\nFailed: 0');
```

For more details, see [Custom Content](https://docs.xyops.io/#Docs/plugins/custom-content).

#### job.setMarkdown

Displays GitHub Flavored Markdown rendered and sanitized by xyOps.

```js
job.setMarkdown('Summary', '**Backup complete**\n\nAll files were uploaded.');
```

Only one HTML, text, or Markdown content block is retained for a job.

For more details, see [Custom Content](https://docs.xyops.io/#Docs/plugins/custom-content).

### Live Updates

#### job.setProgress

Updates the job progress. Pass a fraction from `0.0` through `1.0`, or a percentage greater than `1`.

```js
job.setProgress(0.25);
job.setProgress(50);
job.setProgress(100);
```

#### job.setStatus

Sets the temporary status line shown while the job is running.

```js
job.setStatus('Processing file 34 of 68...');
```

#### job.setLabel

Sets the label displayed beside the Job ID in completed job history.

```js
job.setLabel('Nightly Customer Import');
```

#### job.setPerf

Adds performance metrics to the job. Values normally represent elapsed seconds. xyOps also accepts `pixl-perf` metrics objects.

```js
job.setPerf({ db: 18.51, http: 3.22, gzip: 0.84 });
```

For more details, see [Perf Metrics](https://docs.xyops.io/#Docs/plugins/perf-metrics).

### Completing the Job

#### job.finalSuccess

Completes the job successfully with code `0`. The message is optional and defaults to `Success`.

```js
job.finalSuccess('Imported 250 records');
```

#### job.finalError

Completes the job with an error. The code defaults to `1`, and the message defaults to `Unknown Error`.

```js
job.finalError(999, 'Database connection failed');
```

An error code may be a number or string, but it must be truthy.

### Low-Level Output

#### job.write

Writes one raw XYWP update immediately. The SDK adds `xy: 1`, serializes the object onto one line, and appends a newline. Prefer the specific helpers above when one is available.

```js
job.write({ progress: 0.5, status: 'Halfway there...' });
```

Do not include a final `code` with `job.write()` and then continue sending updates. Prefer `finalSuccess()` or `finalError()` so the SDK also prevents accidental writes after completion.

## Complete Job Example

```js
const { api, job } = require('@pixlcore/xyops-sdk');

(async function() {
	try {
		await job.read();
		
		let eventId = job.getParam('event_id');
		job.setLabel('Event Inspector');
		job.setStatus('Loading event...');
		job.setProgress(10);
		
		let { err, data } = await api.getEvent({ id: eventId });
		if (err) return job.finalError(1, err.message || String(err));
		
		job.addData({
			event_id: data.event.id,
			event_title: data.event.title
		});
		
		job.setMarkdown(
			'Event Summary',
			'Loaded **' + data.event.title + '** successfully.'
		);
		job.setProgress(100);
		job.finalSuccess('Event loaded');
	}
	catch (err) {
		job.finalError(1, err.message || String(err));
	}
})();
```

When this code runs as an xyOps job, the API client automatically uses `JOB_BASE_URL`. You still need to make an API key available as `XYOPS_API_KEY`, typically through the xyOps Secret Vault.

## API Client

### Configuration

Set these environment variables before loading the SDK:

| Variable | Required | Description |
|----------|----------|-------------|
| `XYOPS_BASE_URL` | Yes, outside a job | Base URL of your xyOps conductor, such as `https://xyops.example.com`. |
| `XYOPS_API_KEY` | Yes | An xyOps API Key with the privileges required by the APIs you call. |
| `JOB_BASE_URL` | (Automatic) | Base URL supplied to running xyOps jobs. This is used when `XYOPS_BASE_URL` is not set. |
| `XYOPS_USER_AGENT` | No | Replaces the default SDK HTTP User-Agent string. |
| `XYOPS_TIMEOUT` | No | Time-to-first-byte timeout in milliseconds. Defaults to `30000`. |
| `XYOPS_CONNECT_TIMEOUT` | No | DNS and socket connection timeout in milliseconds. Defaults to `10000`. |
| `XYOPS_IDLE_TIMEOUT` | No | Socket idle timeout in milliseconds. Defaults to `30000`. |
| `XYOPS_RETRIES` | No | Number of automatic request retries. Defaults to `0`. |
| `XYOPS_RETRY_DELAY` | No | Initial delay between automatic retries in milliseconds. The delay doubles after each retry. Defaults to `50`. |
| `XYOPS_RETRY_DELAY_MAX` | No | Maximum delay between automatic retries in milliseconds. Defaults to `8000`. |

For example:

```sh
export XYOPS_BASE_URL="https://xyops.example.com"
export XYOPS_API_KEY="YOUR_API_KEY"
```

The client automatically sends the API key in the `X-API-Key` header.

### Making a Request

API methods use camel case. The SDK converts the method name to the snake case xyOps API name, so [api.getEvent()](#getevent) calls [get_event](https://docs.xyops.io/#Docs/api/get_event):

```js
const { api } = require('@pixlcore/xyops-sdk');

(async function() {
	let { err, data } = await api.getEvent({ id: 'emri0e0tnxibay5t' });
	
	if (err) {
		console.error(err);
		return;
	}
	
	console.log(data.event);
})();
```

The first argument is the API request object.  Depending on the API, this may be automatically serialized as a query string, or passed as JSON POST data.

### Responses and Errors

The API client does not throw by default. Every call resolves to the following object:

```js
let { err, data, resp, perf } = await api.getEvent({ id: 'emri0e0tnxibay5t' });
```

| Property | Description |
|----------|-------------|
| `err` | An error object or message on failure. It will be false or undefined on success. |
| `data` | Response data. Standard API responses are parsed into JavaScript objects. Downloads and streams may not include this. |
| `resp` | The raw Node.js [IncomingMessage](https://nodejs.org/api/http.html#class-httpincomingmessage) response. |
| `perf` | A [pixl-perf](https://github.com/jhuckaby/pixl-perf) request tracker. Call `perf.metrics()` for timing and counter details. |

Check `err` before using `data`:

```js
let { err, data } = await api.getEvents();
if (err) return console.error(err);

console.log(data.rows);
```

If you prefer exceptions, enable throw mode once during startup:

```js
api.throw = true;

try {
	let { data } = await api.getEvent({ id: 'emri0e0tnxibay5t' });
	console.log(data.event);
}
catch (err) {
	console.error(err);
}
```

### Request Options

Pass a optional options object as the second argument. You can specify properties such as `headers`, `files`, and `download`. The SDK always adds the `X-API-Key` header (unless you set your own).

```js
let { err, data } = await api.runEvent(
	{ id: 'emri0e0tnxibay5t' },
	{ headers: { 'X-Request-ID': 'deploy-123' } }
);
```

See the [pixl-request documentation](https://github.com/jhuckaby/pixl-request) for all supported options.

### Downloading Files

Set `download` to a destination path or writable stream, for APIs that return binary responses. The promise resolves after the complete response has been written.

```js
let { err } = await api.getJobLog(
	{ id: 'JOB_ID' },
	{ download: 'dest_file.log' }
);
```

You can use the same pattern for other wrapped binary or streamed APIs. Endpoints with extra path components or nonstandard GET names may require a direct HTTP request, as noted in the catalog.

### Uploading Files

Pass file paths in `opts.files` like this:

```js
let { err } = await api.uploadBucketFiles(
	{ id: 'BUCKET_ID' },
	{ files: ['file1.txt', 'file2.txt'] }
);
```

You can pass the files array directly as a shorthand:

```js
let { err } = await api.uploadBucketFiles(
	{ id: 'BUCKET_ID' },
	['file1.txt', 'file2.txt']
);
```

The same pattern works with APIs such as [uploadFiles](#uploadfiles), [runEvent](#runevent), [createTicket](#createticket), [uploadUserTicketFiles](#uploaduserticketfiles), and [sendEmail](#sendemail).

### Streaming a Live Job

[streamJob](#streamjob) watches a live job, and calls your iterator function for every update (i.e. progress, state changes, completion, etc.):

```js
let { err } = await api.streamJob({ id: 'JOB_ID' }, function(data) {
	// called repeatedly for each streaming job update
	console.log(data);
});
```

The call remains pending until the event stream closes.

## API Catalog

Every standard API method is available via the SDK. The examples below show the SDK method and an example request. Follow each link for parameters, privileges, and response fields.

All examples assume you've preloaded the API:

```js
const { api } = require('@pixlcore/xyops-sdk');
```

### Alerts

#### getAlerts

Fetch all alert definitions. This call does not require any parameters. See the [get_alerts](https://docs.xyops.io/#Docs/api/get_alerts) API reference for response details.

```js
let { err, data } = await api.getAlerts();
if (err) return console.error(err);

console.log(data.rows);
```

#### getAlert

Fetch one alert definition by its ID. See the [get_alert](https://docs.xyops.io/#Docs/api/get_alert) API reference for parameter and response details.

```js
let { err, data } = await api.getAlert({ id: 'load_avg_high' });
if (err) return console.error(err);

console.log(data.alert);
```

#### createAlert

Create a new alert definition. See the [create_alert](https://docs.xyops.io/#Docs/api/create_alert) API reference for all supported alert properties.

```js
let { err, data } = await api.createAlert({
	title: 'High CPU Load',
	expression: 'monitors.load_avg >= (cpu.cores + 1)',
	message: 'CPU load average is too high: {{float(monitors.load_avg)}}',
	monitor_id: 'load_avg',
	enabled: true,
	samples: 1
});
if (err) return console.error(err);

console.log(data.alert);
```

#### updateAlert

Update selected properties on an existing alert. The request is shallow-merged, so properties you omit are left unchanged. See the [update_alert](https://docs.xyops.io/#Docs/api/update_alert) API reference for details.

```js
let { err } = await api.updateAlert({
	id: 'load_avg_high',
	title: 'High CPU Load',
	expression: 'monitors.load_avg >= (cpu.cores + 1)'
});
if (err) return console.error(err);
```

#### testAlert

Test an alert expression and message against the current data from a server. See the [test_alert](https://docs.xyops.io/#Docs/api/test_alert) API reference for response details.

```js
let { err, data } = await api.testAlert({
	server: 'SERVER_ID',
	expression: 'monitors.load_avg >= (cpu.cores + 1)',
	message: 'CPU load average is too high: {{float(monitors.load_avg)}}'
});
if (err) return console.error(err);

console.log(data.result, data.message);
```

#### deleteAlert

Permanently delete an alert definition by its ID. See the [delete_alert](https://docs.xyops.io/#Docs/api/delete_alert) API reference for privilege requirements.

```js
let { err } = await api.deleteAlert({ id: 'load_avg_high' });
if (err) return console.error(err);
```

### Buckets

#### getBuckets

Fetch all storage bucket definitions. Bucket data and file lists are not included. See the [get_buckets](https://docs.xyops.io/#Docs/api/get_buckets) API reference for response details.

```js
let { err, data } = await api.getBuckets();
if (err) return console.error(err);

console.log(data.rows);
```

#### getBucket

Fetch one bucket definition, including its user-defined data and file list. See the [get_bucket](https://docs.xyops.io/#Docs/api/get_bucket) API reference for response details.

```js
let { err, data } = await api.getBucket({ id: 'BUCKET_ID' });
if (err) return console.error(err);

console.log(data.bucket, data.data, data.files);
```

#### createBucket

Create a new storage bucket, optionally with initial user-defined data. Files must be uploaded separately. See the [create_bucket](https://docs.xyops.io/#Docs/api/create_bucket) API reference for all supported bucket properties.

```js
let { err, data } = await api.createBucket({
	title: 'Build Artifacts',
	enabled: true,
	data: {
		build: 42,
		status: 'ready'
	}
});
if (err) return console.error(err);

console.log(data.bucket);
```

#### updateBucket

Update selected properties on an existing bucket. The request is shallow-merged, so properties you omit are left unchanged. See the [update_bucket](https://docs.xyops.io/#Docs/api/update_bucket) API reference for details.

```js
let { err } = await api.updateBucket({
	id: 'BUCKET_ID',
	title: 'Release Artifacts',
	notes: 'Files from production releases'
});
if (err) return console.error(err);
```

#### deleteBucket

Permanently delete a bucket and all of its data and files. See the [delete_bucket](https://docs.xyops.io/#Docs/api/delete_bucket) API reference for privilege requirements.

```js
let { err } = await api.deleteBucket({ id: 'BUCKET_ID' });
if (err) return console.error(err);
```

#### writeBucketData

Shallow-merge user-defined data into an existing bucket. Set `fetch` to `true` to return the complete merged data object. See the [write_bucket_data](https://docs.xyops.io/#Docs/api/write_bucket_data) API reference for details.

```js
let { err, data } = await api.writeBucketData({
	id: 'BUCKET_ID',
	fetch: true,
	data: {
		build: 43,
		status: 'complete'
	}
});
if (err) return console.error(err);

console.log(data.data);
```

#### uploadBucketFiles

Upload one or more files into a bucket using a multipart request. Existing files with the same normalized filenames are replaced. See the [upload_bucket_files](https://docs.xyops.io/#Docs/api/upload_bucket_files) API reference for details.

```js
let { err } = await api.uploadBucketFiles(
	{ id: 'BUCKET_ID' },
	['report.csv', 'summary.txt']
);
if (err) return console.error(err);
```

#### deleteBucketFile

Permanently delete one file from a bucket using its normalized filename. See the [delete_bucket_file](https://docs.xyops.io/#Docs/api/delete_bucket_file) API reference for details.

```js
let { err } = await api.deleteBucketFile({
	id: 'BUCKET_ID',
	filename: 'report.csv'
});
if (err) return console.error(err);
```

#### emptyBucket

Permanently remove all files, all user-defined data, or both, while keeping the bucket itself. See the [empty_bucket](https://docs.xyops.io/#Docs/api/empty_bucket) API reference for details.

```js
let { err } = await api.emptyBucket({
	id: 'BUCKET_ID',
	files: true,
	data: true
});
if (err) return console.error(err);
```

### Categories

#### getCategories

Fetch all category definitions. This call does not require any parameters. See the [get_categories](https://docs.xyops.io/#Docs/api/get_categories) API reference for response details.

```js
let { err, data } = await api.getCategories();
if (err) return console.error(err);

console.log(data.rows);
```

#### getCategory

Fetch one category definition by its ID. See the [get_category](https://docs.xyops.io/#Docs/api/get_category) API reference for parameter and response details.

```js
let { err, data } = await api.getCategory({ id: 'general' });
if (err) return console.error(err);

console.log(data.category);
```

#### createCategory

Create a new category for organizing events. See the [create_category](https://docs.xyops.io/#Docs/api/create_category) API reference for all supported category properties.

```js
let { err, data } = await api.createCategory({
	title: 'Maintenance',
	enabled: true,
	color: 'blue',
	notes: 'Scheduled maintenance events',
	limits: [],
	actions: []
});
if (err) return console.error(err);

console.log(data.category);
```

#### updateCategory

Update selected properties on an existing category. The request is shallow-merged, so properties you omit are left unchanged. See the [update_category](https://docs.xyops.io/#Docs/api/update_category) API reference for details.

```js
let { err } = await api.updateCategory({
	id: 'general',
	title: 'General Jobs',
	color: 'blue'
});
if (err) return console.error(err);
```

#### deleteCategory

Permanently delete a category by its ID. xyOps refuses the deletion if any events are still assigned to the category. See the [delete_category](https://docs.xyops.io/#Docs/api/delete_category) API reference for privilege requirements.

```js
let { err } = await api.deleteCategory({ id: 'CATEGORY_ID' });
if (err) return console.error(err);
```

### Channels

#### getChannels

Fetch all channel definitions. See the [get_channels](https://docs.xyops.io/#Docs/api/get_channels) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getChannels();
if (err) return console.error(err);

console.log(data.rows);
```

#### getChannel

Fetch one channel definition by its ID. See the [get_channel](https://docs.xyops.io/#Docs/api/get_channel) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getChannel({ id: 'sev1' });
if (err) return console.error(err);

console.log(data.channel);
```

#### createChannel

Create a new channel. See the [create_channel](https://docs.xyops.io/#Docs/api/create_channel) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.createChannel({ title: 'On Call', enabled: true, users: ['admin'] });
if (err) return console.error(err);

console.log(data.channel);
```

#### updateChannel

Update an existing channel. See the [update_channel](https://docs.xyops.io/#Docs/api/update_channel) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.updateChannel({ id: 'sev1', max_per_day: 5 });
if (err) return console.error(err);
```

#### deleteChannel

Permanently delete an existing channel. See the [delete_channel](https://docs.xyops.io/#Docs/api/delete_channel) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.deleteChannel({ id: 'CHANNEL_ID' });
if (err) return console.error(err);
```

### Events

#### getEvents

Fetch event definitions, optionally filtered by properties such as plugin or enabled state. See the [get_events](https://docs.xyops.io/#Docs/api/get_events) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getEvents({ enabled: true });
if (err) return console.error(err);

console.log(data.rows);
```

#### getEvent

Fetch one event definition by its ID. See the [get_event](https://docs.xyops.io/#Docs/api/get_event) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getEvent({ id: 'EVENT_ID' });
if (err) return console.error(err);

console.log(data.event);
```

#### getEventHistory

Fetch the revision history for an event. See the [get_event_history](https://docs.xyops.io/#Docs/api/get_event_history) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getEventHistory({ id: 'EVENT_ID', limit: 20 });
if (err) return console.error(err);

console.log(data.rows);
```

#### createEvent

Create a new event. See the [create_event](https://docs.xyops.io/#Docs/api/create_event) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.createEvent({
	title: 'Nightly Task',
	enabled: true,
	category: 'general',
	targets: ['main'],
	algo: 'random',
	plugin: 'shellplug',
	params: {
		script: "#!/bin/bash\n\necho 'Hi'\n"
	}
});
if (err) return console.error(err);

console.log(data.event);
```

#### updateEvent

Update an existing event. See the [update_event](https://docs.xyops.io/#Docs/api/update_event) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.updateEvent({ id: 'EVENT_ID', enabled: false });
if (err) return console.error(err);
```

#### deleteEvent

Permanently delete an existing event. See the [delete_event](https://docs.xyops.io/#Docs/api/delete_event) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.deleteEvent({ id: 'EVENT_ID' });
if (err) return console.error(err);
```

#### runEvent

Run an event on demand with optional parameter overrides. See the [run_event](https://docs.xyops.io/#Docs/api/run_event) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.runEvent({ id: 'EVENT_ID', params: { mode: 'full' } });
if (err) return console.error(err);

console.log(data);
```

### Files

#### uploadFiles

Upload one or more general-purpose files for the user (API key in this case). See the [upload_files](https://docs.xyops.io/#Docs/api/upload_files) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.uploadFiles({}, ['report.csv']);
if (err) return console.error(err);

console.log(data);
```

#### deleteJobFile

Delete a file attached to a job. See the [delete_job_file](https://docs.xyops.io/#Docs/api/delete_job_file) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.deleteJobFile({ id: 'JOB_ID', path: 'files/jobs/JOB_ID/.../report.csv' });
if (err) return console.error(err);
```

### Groups

#### getGroups

Fetch all server group definitions. See the [get_groups](https://docs.xyops.io/#Docs/api/get_groups) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getGroups();
if (err) return console.error(err);

console.log(data.rows);
```

#### getGroup

Fetch one server group definition by its ID. See the [get_group](https://docs.xyops.io/#Docs/api/get_group) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getGroup({ id: 'main' });
if (err) return console.error(err);

console.log(data.group);
```

#### createGroup

Create a new group. See the [create_group](https://docs.xyops.io/#Docs/api/create_group) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.createGroup({ title: 'Linux Servers', hostname_match: '^linux-' });
if (err) return console.error(err);

console.log(data.group);
```

#### updateGroup

Update an existing group. See the [update_group](https://docs.xyops.io/#Docs/api/update_group) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.updateGroup({ id: 'main', title: 'Production' });
if (err) return console.error(err);
```

#### deleteGroup

Permanently delete an existing server group. See the [delete_group](https://docs.xyops.io/#Docs/api/delete_group) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.deleteGroup({ id: 'GROUP_ID' });
if (err) return console.error(err);
```

#### watchGroup

Start or stop automatic snapshots for a server group. See the [watch_group](https://docs.xyops.io/#Docs/api/watch_group) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.watchGroup({ id: 'main', duration: 3600 });
if (err) return console.error(err);
```

#### createGroupSnapshot

Create a snapshot containing the latest data for a server group. See the [create_group_snapshot](https://docs.xyops.io/#Docs/api/create_group_snapshot) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.createGroupSnapshot({ group: 'main' });
if (err) return console.error(err);

console.log(data);
```

### Jobs

#### getActiveJobs

Fetch active jobs. See the [get_active_jobs](https://docs.xyops.io/#Docs/api/get_active_jobs) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getActiveJobs({ limit: 50 });
if (err) return console.error(err);

console.log(data.rows);
```

#### getActiveJobSummary

Fetch active job summary. See the [get_active_job_summary](https://docs.xyops.io/#Docs/api/get_active_job_summary) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getActiveJobSummary();
if (err) return console.error(err);

console.log(data.events);
```

#### getWorkflowJobSummary

Fetch workflow job summary. See the [get_workflow_job_summary](https://docs.xyops.io/#Docs/api/get_workflow_job_summary) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getWorkflowJobSummary({ 'workflow.job': 'JOB_ID' });
if (err) return console.error(err);

console.log(data.nodes);
```

#### getJob

Fetch job data for a specific job, which may be running or completed. See the [get_job](https://docs.xyops.io/#Docs/api/get_job) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getJob({ id: 'JOB_ID' });
if (err) return console.error(err);

console.log(data.job);
```

#### getJobs

Fetch multiple jobs by their IDs. See the [get_jobs](https://docs.xyops.io/#Docs/api/get_jobs) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getJobs({ ids: ['JOB_ID_1', 'JOB_ID_2'] });
if (err) return console.error(err);

console.log(data.jobs);
```

#### getJobLog

Download a job log to a local file. See the [get_job_log](https://docs.xyops.io/#Docs/api/get_job_log) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.getJobLog({ id: 'JOB_ID' }, { download: 'job.log' });
if (err) return console.error(err);
```

#### streamJob

Receive live job updates over [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events). See the [stream_job](https://docs.xyops.io/#Docs/api/stream_job) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.streamJob({ id: 'JOB_ID' }, data => console.log(data));
if (err) return console.error(err);
```

#### updateJob

Update an existing job (administrator only). See the [update_job](https://docs.xyops.io/#Docs/api/update_job) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.updateJob({ id: 'JOB_ID', label: 'Corrected Label' });
if (err) return console.error(err);
```

#### resumeJob

Resume a suspended active job with optional parameters. See the [resume_job](https://docs.xyops.io/#Docs/api/resume_job) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.resumeJob({ id: 'JOB_ID', params: { approved: true } });
if (err) return console.error(err);
```

#### jobSkipDelay

Skip the current delay period for an active job. See the [job_skip_delay](https://docs.xyops.io/#Docs/api/job_skip_delay) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.jobSkipDelay({ id: 'JOB_ID' });
if (err) return console.error(err);
```

#### manageJobTags

Replace the tags on a completed job. See the [manage_job_tags](https://docs.xyops.io/#Docs/api/manage_job_tags) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.manageJobTags({ id: 'JOB_ID', tags: ['important'] });
if (err) return console.error(err);
```

#### abortJob

Abort a running job. See the [abort_job](https://docs.xyops.io/#Docs/api/abort_job) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.abortJob({ id: 'JOB_ID' });
if (err) return console.error(err);
```

#### deleteJob

Permanently delete an existing completed job, including its log and files. See the [delete_job](https://docs.xyops.io/#Docs/api/delete_job) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.deleteJob({ id: 'JOB_ID' });
if (err) return console.error(err);
```

#### flushEventQueue

Remove all queued jobs for an event. See the [flush_event_queue](https://docs.xyops.io/#Docs/api/flush_event_queue) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.flushEventQueue({ id: 'EVENT_ID' });
if (err) return console.error(err);
```

### Monitors

#### getMonitors

Fetch all monitor definitions. See the [get_monitors](https://docs.xyops.io/#Docs/api/get_monitors) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getMonitors();
if (err) return console.error(err);

console.log(data.rows);
```

#### getMonitor

Fetch one monitor definition by its ID. See the [get_monitor](https://docs.xyops.io/#Docs/api/get_monitor) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getMonitor({ id: 'cpu_usage' });
if (err) return console.error(err);

console.log(data.monitor);
```

#### createMonitor

Create a new monitor. See the [create_monitor](https://docs.xyops.io/#Docs/api/create_monitor) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.createMonitor({ 
	title: 'CPU Usage', 
	source: 'cpu.currentLoad', 
	data_type: 'float' 
});
if (err) return console.error(err);

console.log(data.monitor);
```

#### updateMonitor

Update an existing monitor. See the [update_monitor](https://docs.xyops.io/#Docs/api/update_monitor) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.updateMonitor({ id: 'cpu_usage', display: true });
if (err) return console.error(err);
```

#### testMonitor

Test a monitor configuration against current data from a server. See the [test_monitor](https://docs.xyops.io/#Docs/api/test_monitor) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.testMonitor({ server: 'SERVER_ID', source: 'cpu.currentLoad', data_type: 'float' });
if (err) return console.error(err);

console.log(data);
```

#### deleteMonitor

Permanently delete an existing monitor. See the [delete_monitor](https://docs.xyops.io/#Docs/api/delete_monitor) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.deleteMonitor({ id: 'MONITOR_ID' });
if (err) return console.error(err);
```

#### getQuickmonData

Fetch the latest QuickMon samples for one or more servers (last 60 seconds of real-time data). See the [get_quickmon_data](https://docs.xyops.io/#Docs/api/get_quickmon_data) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getQuickmonData({ server: 'SERVER_ID' });
if (err) return console.error(err);

console.log(data.servers);
```

#### getLatestMonitorData

Fetch the latest monitoring timeline entries for a server. See the [get_latest_monitor_data](https://docs.xyops.io/#Docs/api/get_latest_monitor_data) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getLatestMonitorData({ server: 'SERVER_ID', sys: 'hourly', limit: 24 });
if (err) return console.error(err);

console.log(data.rows);
```

#### getHistoricalMonitorData

Fetch historical monitoring timeline entries for a server. See the [get_historical_monitor_data](https://docs.xyops.io/#Docs/api/get_historical_monitor_data) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getHistoricalMonitorData({
	server: 'SERVER_ID',
	sys: 'hourly',
	date: 1783873778,
	limit: 24
});
if (err) return console.error(err);

console.log(data.rows);
```

### Plugins

#### getPlugins

Fetch all plugins. See the [get_plugins](https://docs.xyops.io/#Docs/api/get_plugins) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getPlugins();
if (err) return console.error(err);

console.log(data.rows);
```

#### getPlugin

Fetch a single plugin by its ID. See the [get_plugin](https://docs.xyops.io/#Docs/api/get_plugin) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getPlugin({ id: 'shellplug' });
if (err) return console.error(err);

console.log(data.plugin);
```

#### createPlugin

Create a new plugin. See the [create_plugin](https://docs.xyops.io/#Docs/api/create_plugin) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.createPlugin({
	title: 'Custom Runner',
	type: 'event',
	command: 'node plugin.js',
	enabled: true
});
if (err) return console.error(err);

console.log(data.plugin);
```

#### updatePlugin

Update an existing plugin. See the [update_plugin](https://docs.xyops.io/#Docs/api/update_plugin) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.updatePlugin({ id: 'PLUGIN_ID', enabled: false });
if (err) return console.error(err);
```

#### deletePlugin

Permanently delete an existing plugin. See the [delete_plugin](https://docs.xyops.io/#Docs/api/delete_plugin) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.deletePlugin({ id: 'PLUGIN_ID' });
if (err) return console.error(err);
```

### Roles

#### getRoles

Fetch all user roles. See the [get_roles](https://docs.xyops.io/#Docs/api/get_roles) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getRoles();
if (err) return console.error(err);

console.log(data.rows);
```

#### getRole

Fetch single user role by its ID. See the [get_role](https://docs.xyops.io/#Docs/api/get_role) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getRole({ id: 'all' });
if (err) return console.error(err);

console.log(data.role);
```

#### createRole

Create a new role. See the [create_role](https://docs.xyops.io/#Docs/api/create_role) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.createRole({ title: 'Operators', enabled: true, privileges: { run_jobs: true } });
if (err) return console.error(err);

console.log(data.role);
```

#### updateRole

Update an existing role. See the [update_role](https://docs.xyops.io/#Docs/api/update_role) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.updateRole({ id: 'ROLE_ID', enabled: false });
if (err) return console.error(err);
```

#### deleteRole

Permanently delete an existing role. See the [delete_role](https://docs.xyops.io/#Docs/api/delete_role) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.deleteRole({ id: 'ROLE_ID' });
if (err) return console.error(err);
```

### Search

#### searchJobs

Search completed jobs with custom criteria. See the [search_jobs](https://docs.xyops.io/#Docs/api/search_jobs) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.searchJobs({ query: 'tags:_error', limit: 50 });
if (err) return console.error(err);

console.log(data.rows);
```

#### searchServers

Search servers with custom criteria. See the [search_servers](https://docs.xyops.io/#Docs/api/search_servers) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.searchServers({ query: 'os_platform:linux', limit: 50 });
if (err) return console.error(err);

console.log(data.rows);
```

#### searchAlerts

Search alerts with custom criteria. See the [search_alerts](https://docs.xyops.io/#Docs/api/search_alerts) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.searchAlerts({ query: 'active:true', limit: 50 });
if (err) return console.error(err);

console.log(data.rows);
```

#### searchSnapshots

Search snapshots with custom criteria. See the [search_snapshots](https://docs.xyops.io/#Docs/api/search_snapshots) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.searchSnapshots({ query: 'source:alert', limit: 50 });
if (err) return console.error(err);

console.log(data.rows);
```

#### searchTickets

Search tickets with custom criteria. See the [search_tickets](https://docs.xyops.io/#Docs/api/search_tickets) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.searchTickets({ query: 'status:open', limit: 50 });
if (err) return console.error(err);

console.log(data.rows);
```

#### searchActivity

Search activity with custom criteria. See the [search_activity](https://docs.xyops.io/#Docs/api/search_activity) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.searchActivity({ query: 'action:job_error', limit: 50 });
if (err) return console.error(err);

console.log(data.rows);
```

#### searchRevisionHistory

Search revision history. See the [search_revision_history](https://docs.xyops.io/#Docs/api/search_revision_history) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.searchRevisionHistory({ type: 'events', limit: 20 });
if (err) return console.error(err);

console.log(data.rows);
```

#### searchStatHistory

Fetch daily snapshots from the system statistics history. See the [search_stat_history](https://docs.xyops.io/#Docs/api/search_stat_history) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.searchStatHistory({ limit: 30, current_day: true });
if (err) return console.error(err);

console.log(data.items);
```

#### bulkSearchExport

Export search results to a local CSV, TSV, or NDJSON file. See the [bulk_search_export](https://docs.xyops.io/#Docs/api/bulk_search_export) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.bulkSearchExport(
	{
		index: 'jobs',
		query: 'tags:_error',
		columns: ['id', 'event', 'category', 'plugin', 'completed', 'code'],
		sort_by: 'completed',
		sort_dir: -1,
		format: 'csv',
		compress: true
	},
	{ download: 'error-jobs.csv.gz' }
);
if (err) return console.error(err);
```

### Marketplace

#### marketplace

Search the xyOps Marketplace or fetch supporting product information. See the [marketplace](https://docs.xyops.io/#Docs/api/marketplace) API reference for complete parameters, privileges, and response details.

Search for products:

```js
let { err, data } = await api.marketplace({ query: 'backup', limit: 20 });
if (err) return console.error(err);

console.log(data.rows);
```

Fetch the unique values available for Marketplace filters:

```js
let { err, data } = await api.marketplace({ fields: true });
if (err) return console.error(err);

console.log(data.fields);
```

Fetch a product README in GitHub Flavored Markdown:

```js
let { err, data } = await api.marketplace({
	id: 'pixlcore/xyplug-weather',
	readme: true
});
if (err) return console.error(err);

console.log(data.text);
```

Fetch a product's xyOps Portable Data file:

```js
let { err, data } = await api.marketplace({
	id: 'pixlcore/xyplug-weather',
	data: true
});
if (err) return console.error(err);

console.log(data.data);
```

### Secrets

#### getSecrets

Fetch all secret metadata (does not include encrypted variables). See the [get_secrets](https://docs.xyops.io/#Docs/api/get_secrets) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getSecrets();
if (err) return console.error(err);

console.log(data.rows);
```

#### getSecret

Fetch secret metadata for a single secret by its ID (does not include encrypted variables). See the [get_secret](https://docs.xyops.io/#Docs/api/get_secret) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getSecret({ id: 'SECRET_ID' });
if (err) return console.error(err);

console.log(data.secret);
```

#### decryptSecret

Decrypt and return the variables stored in a secret. See the [decrypt_secret](https://docs.xyops.io/#Docs/api/decrypt_secret) API reference for complete parameters, privileges, and response details.  Administrator only.

```js
let { err, data } = await api.decryptSecret({ id: 'SECRET_ID' });
if (err) return console.error(err);

console.log(data);
```

#### createSecret

Create a new secret. See the [create_secret](https://docs.xyops.io/#Docs/api/create_secret) API reference for complete parameters, privileges, and response details.  Administrator only.

```js
let { err, data } = await api.createSecret({
	title: 'Database',
	enabled: true,
	fields: [
		{ name: 'DB_HOST', value: 'db.example.com' }
	]
});
if (err) return console.error(err);

console.log(data.secret);
```

#### updateSecret

Update an existing secret. See the [update_secret](https://docs.xyops.io/#Docs/api/update_secret) API reference for complete parameters, privileges, and response details.  Administrator only.

```js
let { err } = await api.updateSecret({ id: 'SECRET_ID', enabled: false });
if (err) return console.error(err);
```

#### deleteSecret

Permanently delete an existing secret and its encrypted data. See the [delete_secret](https://docs.xyops.io/#Docs/api/delete_secret) API reference for complete parameters, privileges, and response details.  Administrator only.

```js
let { err } = await api.deleteSecret({ id: 'SECRET_ID' });
if (err) return console.error(err);
```

Treat decrypted secret data as sensitive. Avoid logging it or including it in job output.

### Servers

#### getServerSummaries

Fetch server summaries. See the [get_server_summaries](https://docs.xyops.io/#Docs/api/get_server_summaries) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getServerSummaries();
if (err) return console.error(err);

console.log(data);
```

#### getActiveServers

Fetch active servers. See the [get_active_servers](https://docs.xyops.io/#Docs/api/get_active_servers) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getActiveServers();
if (err) return console.error(err);

console.log(data);
```

#### getActiveServer

Fetch one active server by its ID. See the [get_active_server](https://docs.xyops.io/#Docs/api/get_active_server) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getActiveServer({ id: 'SERVER_ID' });
if (err) return console.error(err);

console.log(data.server);
```

#### getServer

Fetch one server by its ID, including its latest monitoring data. See the [get_server](https://docs.xyops.io/#Docs/api/get_server) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getServer({ id: 'SERVER_ID' });
if (err) return console.error(err);

console.log(data.server);
```

#### updateServer

Update an existing server. See the [update_server](https://docs.xyops.io/#Docs/api/update_server) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.updateServer({ id: 'SERVER_ID', title: 'Build Agent' });
if (err) return console.error(err);
```

#### updateServerData

Shallow-merge user data into a server record. See the [update_server_data](https://docs.xyops.io/#Docs/api/update_server_data) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.updateServerData({ id: 'SERVER_ID', data: { region: 'west' } });
if (err) return console.error(err);
```

#### deleteServer

Permanently delete an existing server. See the [delete_server](https://docs.xyops.io/#Docs/api/delete_server) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.deleteServer({ id: 'SERVER_ID' });
if (err) return console.error(err);
```

#### watchServer

Start or stop automatic snapshots for a server. See the [watch_server](https://docs.xyops.io/#Docs/api/watch_server) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.watchServer({ id: 'SERVER_ID', duration: 3600 });
if (err) return console.error(err);
```

#### createSnapshot

Create a snapshot containing the latest data for a server. See the [create_snapshot](https://docs.xyops.io/#Docs/api/create_snapshot) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.createSnapshot({ server: 'SERVER_ID' });
if (err) return console.error(err);

console.log(data);
```

#### deleteSnapshot

Permanently delete an existing snapshot. See the [delete_snapshot](https://docs.xyops.io/#Docs/api/delete_snapshot) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.deleteSnapshot({ id: 'SNAPSHOT_ID' });
if (err) return console.error(err);
```

### Tags

#### getTags

Fetch all tag definitions. See the [get_tags](https://docs.xyops.io/#Docs/api/get_tags) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getTags();
if (err) return console.error(err);

console.log(data.rows);
```

#### getTag

Fetch single tag definition by its ID. See the [get_tag](https://docs.xyops.io/#Docs/api/get_tag) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getTag({ id: 'important' });
if (err) return console.error(err);

console.log(data.tag);
```

#### createTag

Create a new tag. See the [create_tag](https://docs.xyops.io/#Docs/api/create_tag) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.createTag({ title: 'Important', notes: 'Needs attention' });
if (err) return console.error(err);

console.log(data.tag);
```

#### updateTag

Update an existing tag. See the [update_tag](https://docs.xyops.io/#Docs/api/update_tag) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.updateTag({ id: 'important', title: 'High Priority' });
if (err) return console.error(err);
```

#### deleteTag

Permanently delete an existing tag. See the [delete_tag](https://docs.xyops.io/#Docs/api/delete_tag) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.deleteTag({ id: 'TAG_ID' });
if (err) return console.error(err);
```

### Tickets

#### getTicket

Fetch a single ticket by its ID. See the [get_ticket](https://docs.xyops.io/#Docs/api/get_ticket) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getTicket({ id: 'TICKET_ID' });
if (err) return console.error(err);

console.log(data.ticket);
```

#### getTickets

Fetch multiple tickets by their IDs. See the [get_tickets](https://docs.xyops.io/#Docs/api/get_tickets) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getTickets({ ids: ['TICKET_ID_1', 'TICKET_ID_2'] });
if (err) return console.error(err);

console.log(data.tickets);
```

#### createTicket

Create a new ticket. See the [create_ticket](https://docs.xyops.io/#Docs/api/create_ticket) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.createTicket({
	subject: 'Backup failed',
	type: 'issue',
	status: 'open',
	body: 'See job logs.'
});
if (err) return console.error(err);

console.log(data.ticket);
```

#### updateTicket

Update an existing ticket. See the [update_ticket](https://docs.xyops.io/#Docs/api/update_ticket) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.updateTicket({ id: 'TICKET_ID', status: 'closed' });
if (err) return console.error(err);
```

#### addTicketChange

Add a change, such as a comment, to a ticket. See the [add_ticket_change](https://docs.xyops.io/#Docs/api/add_ticket_change) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.addTicketChange({ id: 'TICKET_ID', change: { type: 'comment', body: 'Investigating.' } });
if (err) return console.error(err);

console.log(data);
```

#### updateTicketChange

Edit or delete an existing ticket change. See the [update_ticket_change](https://docs.xyops.io/#Docs/api/update_ticket_change) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.updateTicketChange({
	id: 'TICKET_ID',
	change_id: 'CHANGE_ID',
	change: { body: 'Updated.' }
});
if (err) return console.error(err);

console.log(data);
```

#### uploadUserTicketFiles

Upload one or more files and attach them to a ticket. See the [upload_user_ticket_files](https://docs.xyops.io/#Docs/api/upload_user_ticket_files) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.uploadUserTicketFiles({ id: 'TICKET_ID', save: true }, ['job-log.txt']);
if (err) return console.error(err);

console.log(data);
```

#### deleteTicketFile

Permanently delete a file attached to a ticket. See the [delete_ticket_file](https://docs.xyops.io/#Docs/api/delete_ticket_file) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.deleteTicketFile({ id: 'TICKET_ID', path: 'files/...' });
if (err) return console.error(err);
```

#### deleteTicket

Permanently delete an existing ticket. See the [delete_ticket](https://docs.xyops.io/#Docs/api/delete_ticket) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.deleteTicket({ id: 'TICKET_ID' });
if (err) return console.error(err);
```

### Web Hooks

#### getWebHooks

Fetch all web hooks. See the [get_web_hooks](https://docs.xyops.io/#Docs/api/get_web_hooks) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getWebHooks();
if (err) return console.error(err);

console.log(data.rows);
```

#### getWebHook

Fetch single web hook by its ID. See the [get_web_hook](https://docs.xyops.io/#Docs/api/get_web_hook) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.getWebHook({ id: 'HOOK_ID' });
if (err) return console.error(err);

console.log(data.web_hook);
```

#### createWebHook

Create a new web hook. See the [create_web_hook](https://docs.xyops.io/#Docs/api/create_web_hook) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.createWebHook({
	title: 'Deploy Hook',
	enabled: true,
	url: 'https://example.com/hook',
	method: 'POST'
});
if (err) return console.error(err);

console.log(data.web_hook);
```

#### updateWebHook

Update an existing web hook. See the [update_web_hook](https://docs.xyops.io/#Docs/api/update_web_hook) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.updateWebHook({ id: 'HOOK_ID', timeout: 60 });
if (err) return console.error(err);
```

#### deleteWebHook

Permanently delete an existing web hook. See the [delete_web_hook](https://docs.xyops.io/#Docs/api/delete_web_hook) API reference for complete parameters, privileges, and response details.

```js
let { err } = await api.deleteWebHook({ id: 'HOOK_ID' });
if (err) return console.error(err);
```

#### testWebHook

Test a web hook configuration by performing a live HTTP request. See the [test_web_hook](https://docs.xyops.io/#Docs/api/test_web_hook) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.testWebHook({ id: 'HOOK_ID', url: 'https://example.com/hook', method: 'POST' });
if (err) return console.error(err);

console.log(data);
```

### Email

#### sendEmail

Send a custom email with optional file attachments. See the [send_email](https://docs.xyops.io/#Docs/api/send_email) API reference for complete parameters, privileges, and response details.

```js
let { err, data } = await api.sendEmail({ to: 'ops@example.com', subject: 'Job Report', body: 'The job completed.' });
if (err) return console.error(err);

console.log(data.details);
```

To attach files to an email:

```js
await api.sendEmail(
	{
		to: 'ops@example.com',
		subject: 'Job Report',
		body: 'The report is attached.'
	},
	['report.csv']
);
```

## License

MIT
