import * as middy from '@middy/core';
import validatorMiddleware from '@middy/validator';
import httpUrlencodeBodyParserMiddleware from '@middy/http-urlencode-body-parser'
import httpJsonBodyParserMiddleware from '@middy/http-json-body-parser'
import httpMultipartBodyParserMiddleware from '@middy/http-multipart-body-parser'
import S3Service from "../services/s3.service";
import {S3Files} from "../db";

const handlerFunc = async (event: any, context: any, callback: any): Promise<any> => {
	let { file, fileName, metadata } = event.body;

	if (typeof metadata === 'string'){
		try{
			metadata = JSON.parse(metadata);
		} catch (e) {
			console.log('error while parsing data', e);
			metadata = {};
		}
	}

	try{
		let data;
		if (typeof file === 'string'){
			data = Buffer.from(file, 'base64');
		} else {
			data = file.content;
		}

		const s3Service = new S3Service();
		const url = await s3Service.uploadFile(data, fileName);

		if (!url){
			throw Error("Unable to save file to s3");
		}

		const response = await S3Files.create({
			file_name: fileName,
			public_url: url,
			metadata: metadata
		});

		if (!response){
			await s3Service.deleteFile(fileName);
			throw Error("Unable to save file data in to database");
		}

		return {
			statusCode: 200,
			body: JSON.stringify({
				success: true,
				public_url: url,
				data: response
			})
		}
	}catch (e) {
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
				file: {},
			},
			required: [
				'fileName',
				'metadata',
				'file'
			]
		}
	}
}

export const fileApiHandler = middy.default()
	.use(httpUrlencodeBodyParserMiddleware())
	.use(httpJsonBodyParserMiddleware())
	.use(httpMultipartBodyParserMiddleware())
	.use(validatorMiddleware({eventSchema: eventSchema }))
	.handler(handlerFunc);
