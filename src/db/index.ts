import { Sequelize, Model, DataTypes } from 'sequelize';
import EnvConfig from '../constants';

export const sequelize = new Sequelize(EnvConfig.DATABASE_URL as string,
	{
		dialect: 'postgres',
		pool: {
			/*
			 * Lambda functions process one request at a time but your code may issue multiple queries
			 * concurrently. Be wary that `sequelize` has methods that issue 2 queries concurrently
			 * (e.g. `Model.findAndCountAll()`). Using a value higher than 1 allows concurrent queries to
			 * be executed in parallel rather than serialized. Careful with executing too many queries in
			 * parallel per Lambda function execution since that can bring down your database with an
			 * excessive number of connections.
			 *
			 * Ideally you want to choose a `max` number where this holds true:
			 * max * EXPECTED_MAX_CONCURRENT_LAMBDA_INVOCATIONS < MAX_ALLOWED_DATABASE_CONNECTIONS * 0.8
			 */
			max: EnvConfig.DATABASE_POOL_MAX as number,
			/*
			 * Set this value to 0 so connection pool eviction logic eventually cleans up all connections
			 * in the event of a Lambda function timeout.
			 */
			min: EnvConfig.DATABASE_POOL_MIN as number,
			/*
			 * Set this value to 0 so connections are eligible for cleanup immediately after they're
			 * returned to the pool.
			 */
			idle: EnvConfig.DATABASE_POOL_IDLE as number,
			// Choose a small enough value that fails fast if a connection takes too long to be established.
			acquire: EnvConfig.DATABASE_POOL_ACQUIRE as number,
		}
	}
);

export const S3Files = sequelize.define('S3Files', {
	file_name: DataTypes.STRING,
	public_url: DataTypes.STRING,
	metadata: DataTypes.JSONB,
});

export const sync = async () => {
	return await sequelize.sync();
}
