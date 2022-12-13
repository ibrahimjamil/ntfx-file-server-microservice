import {IncomingMessage} from "http";

export const getDataFromURL = (url: string) : Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		const http = require('http');
		const https = require('https');

		let client = http;

		if (url.toString().indexOf("https") === 0) {
			client = https;
		}

		client.get(url, (resp: IncomingMessage) => {
			let chunks: any = [];

			// A chunk of data has been recieved.
			resp.on('data', (chunk) => {
				chunks.push(chunk);
			});

			// The whole response has been received. Print out the result.
			resp.on('end', () => {
				resolve(Buffer.concat(chunks));
			});

		}).on("error", (err: Error) => {
			reject(err);
		});
	});
};
