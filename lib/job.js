// xyOps SDK - Job Layer
// See: https://github.com/pixlcore/xyops-sdk
// Copyright (c) 2026 PixlCore LLC, BSD 3-Clause License

const fs = require('fs');
const crypto = require('crypto');
const Logger = require('pixl-logger');
const Perf = require('pixl-perf');
const Tools = require('pixl-tools');

// AES-256-GCM is the AES block cipher with a 256-bit key, used in Galois/Counter Mode 
// (an AEAD mode providing confidentiality and integrity).
const ENC_ALGO = 'aes-256-gcm';
const ENC_SCRYPT_OPTS = { N: 16384, r: 8, p: 1 };

const job = {
	
	params: {},
	secrets: {},
	input: { data: {}, files: [] },
	logger: null,
	perf: null,
	
	async read() {
		// read job data from STDIN
		const chunks = [];
		for await (const chunk of process.stdin) chunks.push(chunk);
		let data = JSON.parse( chunks.join('') );
		Tools.mergeHashInto( this, data );
		
		// initialize perf and logger
		this.perf = new Perf();
		this.perf.setScale(1); // seconds
		this.perf.begin();
		
		this.logger = new Logger(
			this.log_file,
			['hires_epoch', 'date', 'hostname', 'pid', 'event', 'job', 'category', 'code', 'msg', 'data'],
			{
				event: this.event,
				job: this.id,
				sync: true
			}
		);
	},
	
	write(data) {
		// write xywp to stdout immediately (autoflush)
		data.xy = 1;
		fs.writeSync(process.stdout.fd, JSON.stringify(data) + "\n");
	},
	
	getMetrics() {
		// summarize perf metrics, if they were actually populated by the user
		let metrics = undefined;
		if (this.perf && ((Tools.numKeys(this.perf.perf) > 1) || (Tools.numKeys(this.perf.counters) > 0))) {
			metrics = this.perf.metrics();
		}
		return metrics;
	},
	
	finalSuccess(msg) {
		// send final success message
		this.write({ complete: true, code: 0, description: msg || 'Success', perf: this.getMetrics() });
		this.write = function() {}; // prevent further writes
	},
	
	finalError(code, msg) {
		// send final error message
		this.write({ complete: true, code: code || 1, description: msg || 'Unknown Error', perf: this.getMetrics() });
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
	
	encryptValue(value, passphrase, aad) {
		// encrypt JSON-serializable value using strong cipher
		const plaintext = JSON.stringify(value);
		const salt = crypto.randomBytes(16); // per-record KDF salt
		const key = crypto.scryptSync(passphrase, salt, 32, ENC_SCRYPT_OPTS);
		const iv = crypto.randomBytes(12); // 96-bit GCM nonce
		
		const cipher = crypto.createCipheriv(ENC_ALGO, key, iv);
		if (aad) cipher.setAAD(Buffer.isBuffer(aad) ? aad : Buffer.from(String(aad)));
		
		const ptBuf = Buffer.isBuffer(plaintext) ? plaintext : Buffer.from(String(plaintext), 'utf8');
		const ct = Buffer.concat([cipher.update(ptBuf), cipher.final()]);
		const tag = cipher.getAuthTag();
		
		const record = {
			v: 1,
			alg: ENC_ALGO,
			salt: salt.toString('base64'),
			iv: iv.toString('base64'),
			tag: tag.toString('base64'),
			ct: ct.toString('base64')
		};
		
		// encode the entire record as one portable string
		return Buffer.from(JSON.stringify(record), 'utf8').toString('base64');
	},
	
	decryptValue(encrypted, passphrase, aad) {
		// decrypt value previously encrypted with encryptValue
		// this will throw on error, so wrap in try/catch
		const record = JSON.parse( Buffer.from(encrypted, 'base64').toString('utf8') );
		const salt = Buffer.from(record.salt, 'base64');
		const iv = Buffer.from(record.iv, 'base64');
		const tag = Buffer.from(record.tag, 'base64');
		const ct = Buffer.from(record.ct, 'base64');
		
		const key = crypto.scryptSync(passphrase, salt, 32, ENC_SCRYPT_OPTS);
		const decipher = crypto.createDecipheriv(record.alg, key, iv);
		if (aad) decipher.setAAD(Buffer.isBuffer(aad) ? aad : Buffer.from(String(aad)));
		decipher.setAuthTag(tag);
		
		const buf = Buffer.concat([decipher.update(ct), decipher.final()]);
		return JSON.parse( buf.toString('utf8') );
	}
	
};

module.exports = job;
