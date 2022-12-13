import {sync as syncDatabase} from "../db";

const syncSequelizeMiddleware = () => {
	const syncSequelizeMiddlewareAfter = async () => {
		await syncDatabase();
	}

	return {
		before: syncSequelizeMiddlewareAfter
	}
}

export default syncSequelizeMiddleware;
