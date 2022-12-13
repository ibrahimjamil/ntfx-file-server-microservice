import * as middy from '@middy/core'
import {fileApiHandler} from "./apis/file.api";
import {HostedfileApiHandler} from "./apis/hosted_file.api";

import httpHeaderNormalizerMiddleware from '@middy/http-header-normalizer';
import httpRouterHandler from '@middy/http-router';
import httpErrorHandler from '@middy/http-error-handler';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop'
import syncSequelizeMiddleware from "./middlewares";

const routes = [
	{
		method: 'POST',
		path: '/file',
		handler: fileApiHandler
	},
	{
		method: 'POST',
		path: '/hosted_file',
		handler: HostedfileApiHandler
	}
] as any;

export const handler = middy.default()
	.use(doNotWaitForEmptyEventLoop({
		runOnBefore: true,
		runOnAfter: true,
		runOnError: true
	}))
	.use(httpErrorHandler())
	.use(httpHeaderNormalizerMiddleware())
	.use(syncSequelizeMiddleware())
	.handler(httpRouterHandler(routes))
