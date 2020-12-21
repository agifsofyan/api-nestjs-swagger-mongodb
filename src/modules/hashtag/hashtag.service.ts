import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IHashTag } from './interfaces/hashtag.interface';
import { ArrStrToObjectId, arrInArr, onArray } from 'src/utils/StringManipulation';

@Injectable()
export class HashTagService {

	constructor(
		@InjectModel('HashTag') private readonly hashTagModel: Model<IHashTag>
	) {}

	async insertMany(input: any) {
		input = input.map(form => {
			form.name = form.name.split(" ").join("_").toLowerCase()
			return form
		})
		
		const inputName = new Array()
		const tagName = new Array()
		const tagsID = new Array()
		
		const inputContent = input[0].content
		for(let i in input){
			inputName[i] = input[i].name
		}

		console.log('inputName', inputName)

		let tags = await this.hashTagModel.find({ name: {$in: inputName} })
		console.log('tags', tags)
		for(let i in tags){
			// tagsID[i] = tags[i]._id
			tagName[i] = tags[i].name
		}
		console.log('tagName', tagName)
		
		if(tags.length === 0){
			await this.hashTagModel.insertMany(input)
		}else{
			if(tags.length === input.length){
				tags.map(async tag => {
					tag.content.push(inputContent)
					await tag.save();
				})
			}else{
				for(let i in input){
					await this.hashTagModel.findOneAndUpdate(
						{name: input[i].name},
						{name: input[i].name, $push: {
							content: input[i].content
						}},
						{upsert: true, new: true, runValidators: true}
					)
				}
			}
		}
		// else{
			// const getTag = tags.map(async tag => {
				// tag.content.push(inputContent)
				// await tag.save();
			// })
			// const inContent = onArray( inputName, tagName )
			// console.log('inContent', inContent)
			// havetag.content.push(...contendId)
			// await this.hashTagModel.
		// }

		return tags
	}

	async findAll(options?: any): Promise<IHashTag[]> {
		const sortval = (options.sort == 'asc') ? 1 : -1;

		var match = {}
		var sort = {}
		if (options.name) {
			match = { "name": options.name }
		}

		if(options.sort){
			sort = { "name": sortval }
		}else{
			sort = { "created_at": 1 }
		}

		var query = await this.hashTagModel.aggregate([
			{ $match: match},
			{ $sort: sort}
		])

		return query
	}

	async findOne(field: any, value: any): Promise<IHashTag> {
	 	let result;
		try{
		    result = await this.hashTagModel.findOne({[field]: value});
		}catch(error){
		    throw new NotFoundException(`Could nod find Tag with ${field} ${value}`);
		}

		if(!result){
			throw new NotFoundException(`Could nod find Tag with ${field} ${value}`);
		}

		return result;
	}

	// async update(id: string, input: any): Promise<IHashTag> {
	// 	let result;
		
	// 	// Check ID
	// 	try{
	// 	    result = await this.hashTagModel.findById(id);
	// 	}catch(error){
	// 	    throw new NotFoundException(`Could nod find Tag with id ${id}`);
	// 	}

	// 	if(!result){
	// 		throw new NotFoundException(`Could nod find Tag with id ${id}`);
	// 	}

	// 	const initialName = input.name
	// 	const toName = initialName.split(" ").join("_").toLowerCase()
	// 	input.name = toName

	// 	try {
	// 		await this.hashTagModel.findByIdAndUpdate(id, input);
	// 		return await this.hashTagModel.findById(id).exec();
	// 	} catch (error) {
	// 		throw new Error(error)
	// 	}
	// }

	// async delete(id: string): Promise<string> {
	// 	try{
	// 		await this.hashTagModel.findByIdAndRemove(id).exec();
	// 		return 'ok';
	// 	}catch(err){
	// 		throw new NotImplementedException('The Tag could not be deleted');
	// 	}
	// }

	// async deleteMany(arrayId: any): Promise<string> {
	// 	try{
	// 		await this.hashTagModel.deleteMany({ _id: {$in: arrayId} });
	// 		return 'ok';
	// 	}catch(err){
	// 		throw new NotImplementedException('The Tag could not be deleted');
	// 	}
	// }

	async pullSome(name: string, type: string, id: any){
		name = name.split(" ").join("_").toLowerCase()
		const isArray = id instanceof Array
		if(!isArray){
			id = [id]
		}

		const checkTag = await this.hashTagModel.findOne({name: name})

		if(!checkTag){
			throw new BadRequestException('Tag name not found')
		}

		const inType = ['product', 'content', 'order', 'coupon']
		if(!inType.includes(type)){
			throw new BadRequestException('Tag type not found')
		}

		await this.hashTagModel.findOneAndUpdate(
			{name: name},
			{ $pull: { [type]: { $in: id } } }
		)
	}
}
