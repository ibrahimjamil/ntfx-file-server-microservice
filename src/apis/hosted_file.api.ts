import * as middy from '@middy/core';
import validatorMiddleware from '@middy/validator';
import httpUrlencodeBodyParserMiddleware from '@middy/http-urlencode-body-parser'
import httpJsonBodyParserMiddleware from '@middy/http-json-body-parser'
import httpMultipartBodyParserMiddleware from '@middy/http-multipart-body-parser'
import {getDataFromURL} from "../helpers";
import S3Service from "../services/s3.service";
import {S3Files} from "../db";

const handler = async (event: any, context: any, callback: any): Promise<any> => {
	let { file_url, fileName, metadata } = event.body;

	if (typeof metadata === 'string') {
		try{
			metadata = JSON.parse(metadata);
		} catch (e) {
			console.log('error while parsing metadata', e);
			metadata = {};
		}
	}

	try{
		const response = await getDataFromURL(file_url);
		const s3Service = new S3Service();
		const url = await s3Service.uploadFile(response, fileName);

		const save = await S3Files.create({
			file_name: fileName,
			public_url: url,
			metadata: metadata
		});

		if (!save){
			await s3Service.deleteFile(fileName);
			throw Error("Unable to save file data in to database");
		}

		return {
			statusCode: 200,
			body: JSON.stringify({
				success: true,
				public_url: url,
				data: save
			})
		}
	} catch (e) {
		console.log('Error while saving file to bucket', e);
		return {
			statusCode: 200,
			body: JSON.stringify({
				success: false,
				message: "An error occurred while saving the file.",
			})
		}
	}
};

const eventSchema = {
	type: 'object',
	properties: {
		body: {
			type: 'object',
			properties: {
				fileName: { type: 'string' },
				metadata: {},
				file_url: { type: 'string' },
			},
			required: [
				'fileName',
				'metadata',
				'file_url'
			]
		}
	}
}

export const HostedfileApiHandler = middy.default()
	.use(httpUrlencodeBodyParserMiddleware())
	.use(httpJsonBodyParserMiddleware())
	.use(httpMultipartBodyParserMiddleware())
	.use(validatorMiddleware({eventSchema: eventSchema }))
	.handler(handler);
