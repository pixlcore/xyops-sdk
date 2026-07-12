// xyOps SDK - Job Layer
// See: https://github.com/pixlcore/xyops-sdk
// Copyright (c) 2026 PixlCore LLC, BSD 3-Clause License

const fs = require('fs');
const Tools = require('pixl-tools');

const job = {
	
	params: {},
	secrets: {},
	input: { data: {}, files: [] },
	
	async read() {
		// read job data from STDIN
		const chunks = [];
		for await (const chunk of process.stdin) chunks.push(chunk);
		let data = JSON.parse( chunks.join('') );
		Tools.mergeHashInto( this, data );
	},
	
	write(data) {
		// write xywp to stdout immediately (autoflush)
		data.xy = 1;
		fs.writeSync(process.stdout.fd, JSON.stringify(data) + "\n");
	},
	
	finalSuccess(msg) {
		// send final success message
		this.write({ complete: true, code: 0, description: msg || 'Success' });
		this.write = function() {}; // prevent further writes
	},
	
	finalError(code, msg) {
		// send final error message
		this.write({ complete: true, code: code || 1, description: msg || 'Unknown Error' });
		this.write = function() {}; // prevent further writes
	},
	
	getParams() {
		// get all params
		return this.params;
	},
	
	getParam(key) {
		// get named param
		return this.params[key];
	},
	
	getFiles() {
		// get input file array
		if (!this.input) this.input = {};
		return this.input.files || [];
	},
	
	getData(key) {
		// get input data, or specific key
		if (!this.input) this.input = {};
		if (!this.input.data) this.input.data = {};
		return key ? this.input.data[key] : this.input.data;
	},
	
	getWorkflowData(key) {
		// get workflow data, or specific key
		if (!this.workflowData) this.workflowData = {};
		return key ? this.workflowData[key] : this.workflowData;
	},
	
	getServerData(key) {
		// get server data, or specific key
		if (!this.serverData) this.serverData = {};
		return key ? this.serverData[key] : this.serverData;
	},
	
	getSecrets() {
		// get all secrets
		if (!this.secrets) this.secrets = {};
		return this.secrets;
	},
	
	getSecret(key) {
		// get named secret
		if (!this.secrets) this.secrets = {};
		return this.secrets[key];
	},
	
	addWorkflowData(workflowData) {
		// add workflow data to job output (shallow merged)
		this.write({ workflowData });
	},
	
	addServerData(serverData) {
		// add server data to job output (shallow merged)
		this.write({ serverData });
	},
	
	addData(data) {
		// add data to job output (shallow merged)
		this.write({ data });
	},
	
	addFile(file) {
		// add file to job output
		this.write({ push: { files: [file] } });
	},
	
	addFiles(files) {
		// add files to job output
		this.write({ push: { files } });
	},
	
	addAction(action) {
		// dynamically add action to job
		this.write({ push: { actions: [action] } });
	},
	
	addActions(actions) {
		// dynamically add multiple actions to job
		this.write({ push: { actions } });
	},
	
	addTag(tag) {
		// add tag to job
		this.write({ push: { tags: [tag] } });
	},
	
	addTags(tags) {
		// add tags to job
		this.write({ push: { tags } });
	},
	
	setTable(title, header, rows, caption) {
		// add custom user table
		this.write({ table: { title, header, rows, caption } });
	},
	
	setHTML(title, content, caption) {
		// add custom user html content
		this.write({ html: { title, content, caption } });
	},
	
	setText(title, content, caption) {
		// add custom user text content
		this.write({ text: { title, content, caption } });
	},
	
	setMarkdown(title, content, caption) {
		// add custom user markdown content
		this.write({ markdown: { title, content, caption } });
	},
	
	setProgress(amount) {
		// if amount > 1.0, assume percentage, otherwise assume 0 - 1
		if (amount > 1.0) amount /= 100;
		this.write({ progress: amount });
	},
	
	setStatus(status) {
		// set job status line
		this.write({ status });
	},
	
	setLabel(label) {
		// set job label
		this.write({ label });
	},
	
	setPerf(perf) {
		// send performance metrics
		this.write({ perf });
	}
	
};

module.exports = job;
