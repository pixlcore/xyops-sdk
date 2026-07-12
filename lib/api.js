// xyOps SDK - API Layer
// See: https://github.com/pixlcore/xyops-sdk
// Copyright (c) 2026 PixlCore LLC, BSD 3-Clause License

const os = require('os');
const readline = require('readline');
const { PassThrough } = require('stream');
const PixlRequest = require('pixl-request');
const Tools = require('pixl-tools');
const pkg = require('../package.json');

const api = new Proxy({
	
	throw: false,
	
	init() {
		// init http client
		this.request = new PixlRequest( process.env.XYOPS_USER_AGENT || `xyOps SDK v${pkg.version} (Node.js); ${os.hostname()} (${os.platform()}/${os.arch()}); ${process.argv[1]}` );
        this.request.setTimeout( parseInt(process.env.XYOPS_TIMEOUT || 30_000) );
        this.request.setConnectTimeout( parseInt(process.env.XYOPS_CONNECT_TIMEOUT || 10_000) );
        this.request.setIdleTimeout( parseInt(process.env.XYOPS_IDLE_TIMEOUT || 30_000) );
		this.request.setRetries( parseInt(process.env.XYOPS_RETRIES || 0) );
        this.request.setAutoError( true );
        this.request.setKeepAlive( true );
	},
	
	async sendRequest(method, req, opts) {
		// send any API request
		if (!req) req = {};
		if (!opts) opts = {};
		
		let url = process.env.XYOPS_BASE_URL || process.env.JOB_BASE_URL;
		if (!url) return this.doError("Missing 'XYOPS_BASE_URL' and 'JOB_BASE_URL' environment variables.");
		
		let api_key = process.env.XYOPS_API_KEY;
		if (!api_key) return this.doError("Missing 'XYOPS_API_KEY' environment variable.");
		
		// camelCase to snake_case api names
		method = method.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
		
		// some APIs are in the user namespace (pixl-server-user)
		let api_namespace = 'app';
		if (method.match(/^(admin_create|admin_update|admin_delete|admin_get_user|admin_get_users)$/)) api_namespace = 'user';
		
		// compose full url
		url = url.replace(/\/$/, '') + '/api/' + api_namespace + '/' + method;
		
		// if method is get/search, use query string instead of POST
		if (method.match(/^(get_|search_|stream_)/)) {
			url += Tools.composeQueryString(req);
			req = false;
		}
		
		// special prep for streaming apis
		if (method.match(/^(stream_)/)) {
			if (typeof(opts) == 'function') opts = { iterator: opts };
			let iterator = opts.iterator;
			if (!iterator) return this.doError("Missing iterator function for stream.");
			delete opts.iterator;
			
			const input = new PassThrough();
			const rl = readline.createInterface({ input, crlfDelay: Infinity });
			
			rl.on('line', function(line) {
				// parse SSE line and send json to iterator
				if (line.match(/^data\:\s*(.*)$/)) {
					var json = null;
					try { json = JSON.parse(RegExp.$1); }
					catch (err) {;}
					if (json && json.xy) iterator(json);
				}
			});
			
			rl.on('close', function() {
				// all done
			});
			
			opts.download = input;
		} // stream
		else {
			// convert files array to hash (for pixl-request)
			if (Array.isArray(opts)) opts = { files: opts };
			if (opts.files && Array.isArray(opts.files)) {
				var files = {};
				opts.files.forEach( function(file, idx) { 
					idx++; files['file' + idx] = file; 
				} );
				opts.files = files;
			}
		}
		
		// add API key
		if (!opts.headers) opts.headers = {};
		opts.headers['X-API-Key'] = api_key;
		
		let resp = null;
		
		// if we have files, send as multi-part HTTP POST
		if (opts.files) {
			opts.data = {
				json: JSON.stringify(req || {})
			};
			
			try { resp = await this.request.post(url, opts); }
			catch (err) { return this.doError(err); }
			
			// parse response
			try { resp.data = JSON.parse( resp.data.toString('utf8') ); }
			catch (err) { return this.doError(err); }
		}
		else if (opts.download) {
			// use get for downloads or streaming SSE response
			try { resp = await this.request.get(url, opts); }
			catch (err) { return this.doError(err); }
		}
		else {
			// send using JSON API
			try { resp = await this.request.json(url, req, opts); }
			catch (err) { return this.doError(err); }
		}
		
		// standard xyops response: if code is truthy, it is an error
		if (resp.data && resp.data.code) resp.err = resp.data.description;
		
		return resp;
	},
	
	doError(err) {
		// throw or return error
		if (this.throw) {
			if (typeof(err) == 'string') err = new Error(err);
			throw err;
		}
		else return { err };
	}
	
}, 
{
	// magic api-to-function proxy
	get(target, prop, receiver) {
		// If the property actually exists, return it normally.
		if (prop in target) {
			return Reflect.get(target, prop, receiver);
		}
		
		// Don't accidentally make us "thenable".
		if (prop === 'then') {
			return undefined;
		}
		
		// Otherwise return a wrapper that forwards to sendRequest().
		return (...args) => target.sendRequest(prop, ...args);
	}
	
}); // api

api.init();
module.exports = api;
