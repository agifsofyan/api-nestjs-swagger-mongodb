import { 
	Injectable,
	NotImplementedException,
	BadRequestException,
	NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AWS_CONFIG } from 'src/config/aws.configuration';
import * as AWS from 'aws-sdk';
import { Slugify } from 'src/utils/StringManipulation';
import { IMedia } from './interfaces/media.interface';
import { OptQuery } from 'src/utils/OptQuery';

const bucket = `${AWS_CONFIG.AWS_BUCKET}/${AWS_CONFIG.AWS_ENDPOINT}`

@Injectable()
export class UploadService {
	s3: AWS.S3

  	constructor(@InjectModel('Media') private readonly mediaModel: Model<IMedia>) {
		//this.s3 = new AWS.S3()
    		AWS.config.update({
      			accessKeyId: AWS_CONFIG.AWS_KEY_ID,
      			secretAccessKey: AWS_CONFIG.AWS_SECRET_KEY,
				region: AWS_CONFIG.AWS_REGION
    		})
    		this.s3 = new AWS.S3()
  	}

	async upload(path: string, file: any, sub_path?: string) {
		var contentType = file.mimetype
		if(file.mimetype == 'video/mpeg' || file.mimetype == 'video/x-matroska' || file.mimetype == 'video/x-mjpeg' || file.mimetype == 'video/x-msvideo'){
			contentType = 'video/mp4'
		}

		var dir = path

		if(sub_path){
			dir = path + '/' + sub_path
		}

		const params = {
			Bucket: bucket + '/' + dir,
			//Key: `figa_${Date.now().toString()}_${file.originalname}`,
			ContentEncoding: 'base64',
            ContentDisposition: 'inline',
            ContentType: contentType,
			Key: Slugify(file.originalname),
			Body: file.buffer,
			ACL: AWS_CONFIG.AWS_ACL
		}
      			
	    try{
			const sendFile = await this.s3.upload(params).promise();

			const filetype = contentType.split('/')

			const media = {
				path: path,
				sub_path: sub_path ? sub_path : null,
				originalname: file.originalname,
				filename: Slugify(file.originalname),
				filetype: filetype[0],
				mimetype: file.mimetype,
				url: sendFile.Location
			}

			//return await result

			const query = new this.mediaModel(media)

			await query.save()

			return query
			
		}catch(err){
			throw new NotImplementedException('error when upload')
		}
	}

	// async multipleUpload(path: string, files: any, sub_path?: string){
	// 	var params = new Array() 
	// 	var fileReponse = new Array()
	// 	var sendFile = new Array()
	// 	var contentType = new Array()

	// 	for(let i in files){
	// 		contentType[i] = files[i].mimetype
			
	// 		if(files[i].mimetype == 'video/mpeg' || files[i].mimetype == 'video/x-matroska' || files[i].mimetype == 'video/x-mjpeg' || files[i].mimetype == 'video/x-msvideo'){
	// 			contentType[i] = 'video/mp4'
	// 		}

	// 		var dir = path

	// 		if(sub_path){
	// 			dir = path + '/' + sub_path
	// 		}

	// 		params[i] = {
	// 			Bucket: bucket + '/' + dir,
	// 			ContentEncoding: 'base64',
    //         	ContentDisposition: 'inline',
    //         	ContentType: contentType[i],
	// 			Key: Slugify(files[i].originalname),
	// 			Body: files[i].buffer,
	// 			ACL: AWS_CONFIG.AWS_ACL
	// 		}

	// 		fileReponse[i] = {
	// 			originalname: files[i].originalname,
	// 			filename: Slugify(files[i].originalname),
	// 			mimetype: files[i].mimetype
	// 		};

	// 		sendFile[i] = await this.s3.upload(params[i]).promise();

	// 		fileReponse[i].url = sendFile[i].Location
	// 	};

	// 	return fileReponse
	// }

	async findAll(options: OptQuery): Promise<IMedia[]> {
		const {
			offset,
			limit,
			sortby,
			sortval,
			fields,
			value,
			optFields,
			optVal
		} = options;

		const offsets = (offset == 0 ? offset : (offset - 1))
		const skip = offsets * limit
		const sortvals = (sortval == 'asc') ? 1 : -1

		var filter: object = { [fields]: value  }

		if(optFields){
			if(!fields){
				filter = { [optFields]: optVal }
			}
			filter = { [fields]: value, [optFields]: optVal }
		}

		if (sortby){
			if (fields) {

				return await this.mediaModel
					.find(filter)
					.skip(Number(skip))
					.limit(Number(limit))
					.sort({ [sortby]: sortvals })
			} else {

				return await this.mediaModel
					.find()
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ [options.sortby]: sortvals })
			}
		}else{
			if (options.fields) {

				return await this.mediaModel
					.find(filter)
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ 'created_at': 'desc' })
			} else {

				return await this.mediaModel
					.find(filter)
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ 'created_at': 'desc' })
			}
		}
	}

	async deleteFile(id: any) {
	    const isArray = id instanceof Array
	    if(!isArray){
			id = [id]
	    }

	    var getDB
	    try{
	    	getDB = await this.mediaModel.find({ _id: { $in: id } })
	    }catch(err){
		throw new NotImplementedException(`_id format not valid`)
	    }

	    if(getDB.length <= 0){
		throw new NotFoundException('media file is empty')
	    }

	    var Objects = new Array()
	    for(let i in getDB){
			Objects[i] = { Key: `${AWS_CONFIG.AWS_ENDPOINT}/${getDB[i].path}/${getDB[i].filename}` }
	    }

	    const params = {
  		Bucket: AWS_CONFIG.AWS_BUCKET,
  		Delete: {
        	   Objects: Objects
    		}
	    };

	    try{
	        await this.s3.deleteObjects(params).promise();
			await this.mediaModel.deleteMany({ _id: { $in: id } })
		}catch(err){
			throw new BadRequestException(err)
	    }
	}
}
