import {S3} from 'aws-sdk';
import EnvConfig from '../constants';
import {Body, ObjectCannedACL} from "aws-sdk/clients/s3";

class S3Service {
	protected s3: S3 = new S3({
		accessKeyId: EnvConfig.IAM_USER_KEY,
		secretAccessKey: EnvConfig.IAM_USER_SECRET
	});

	public async uploadFile(data: Body, name: string, acl: ObjectCannedACL = "public-read") : Promise<string | undefined> {
		try{
			const response = await (this.s3.upload({
				ACL: acl,
				Body: data,
				Bucket: EnvConfig.BUCKET_NAME as string,
				Key: name
			}).promise());

			if (response && response.Location){
				return response.Location;
			}
			return undefined;
		} catch (e) {
			console.log('s3 upload error: ', e);
			return undefined;
		}
	}

	public async deleteFile(name: string) : Promise<boolean> {
		try{
			const response = await (this.s3.deleteObject({
				Bucket: EnvConfig.BUCKET_NAME as string,
				Key: name
			}).promise());

			if (response && response.DeleteMarker){
				return response.DeleteMarker;
			}
			return false;
		} catch (e) {
			console.log('s3 delete error: ', e);
			return false;
		}
	}
}

export default S3Service;
