import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { ITopic } from './interfaces/topic.interface';
import { OptQuery } from 'src/utils/OptQuery';
import { IContent } from '../content/interfaces/content.interface';
import { IProduct } from '../product/interfaces/product.interface';
import { StrToUnix } from 'src/utils/StringManipulation';
import { RatingService } from '../rating/rating.service';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class TopicService {

	constructor(
		@InjectModel('Topic') private readonly topicModel: Model<ITopic>,
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
		@InjectModel('Content') private readonly contentModel: Model<IContent>,
		private readonly ratingService: RatingService,
	) {}

	async create(createTopicDto: any): Promise<ITopic> {
		const createTopic = new this.topicModel(createTopicDto);

		// Check if topic name is already exist
        const isTopicNameExist = await this.topicModel.findOne({ name: createTopic.name });
        	
		if (isTopicNameExist) {
        	throw new BadRequestException('That topic name (slug) is already exist.');
		}

		return await createTopic.save();
	}

	async findAll(options: OptQuery): Promise<ITopic[]> {
		const offset = (options.offset == 0 ? options.offset : (options.offset - 1));
		const skip = offset * options.limit;
		const sortval = (options.sortval == 'asc') ? 1 : -1;

		var query: any
		if (options.sortby){
			if (options.fields) {

				query = await this.topicModel
					.find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ [options.sortby]: sortval })
					.populate('rating')

			} else {

				query = await this.topicModel
					.find()
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ [options.sortby]: sortval })
					.populate('rating')

			}
		}else{
			if (options.fields) {

				query = await this.topicModel
					.find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ 'updated_at': 'desc' })
					.populate('rating')

			} else {

				query = await this.topicModel
					.find()
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ 'updated_at': 'desc' })
					.populate('rating')
			}
		}

		query.rating.average = await this.ratingService.percentage(query.rating)
		console.log('query', query)
		return query
	}

	async findById(id: string): Promise<ITopic> {
	 	let result;
		try{
		    result = await this.topicModel.findById(id);
		}catch(error){
		    throw new NotFoundException(`Could nod find topic with id ${id}`);
		}

		if(!result){
			throw new NotFoundException(`Could nod find topic with id ${id}`);
		}

		return result;
	}

	async update(id: string, updateTopicDto: any): Promise<ITopic> {
		let result;
		
		// Check ID
		try{
		    result = await this.topicModel.findById(id);
		}catch(error){
		    throw new NotFoundException(`Could nod find topic with id ${id}`);
		}

		if(!result){
			throw new NotFoundException(`Could nod find topic with id ${id}`);
		}

		try {
			await this.topicModel.findByIdAndUpdate(id, updateTopicDto);
			return await this.topicModel.findById(id).exec();
		} catch (error) {
			throw new Error(error)
		}
	}

	async delete(id: string): Promise<string> {
		try{
			await this.topicModel.findByIdAndRemove(id).exec();
			return 'ok';
		}catch(err){
			throw new NotImplementedException('The topic could not be deleted');
		}
	}

	async deleteMany(arrayId: any): Promise<string> {
		try{
			await this.topicModel.deleteMany({ _id: {$in: arrayId} });
			return 'ok';
		}catch(err){
			throw new NotImplementedException('The topic could not be deleted');
		}
	}

	async search(value: any): Promise<ITopic[]> {
		const result = await this.topicModel.find({
			"name": {$regex: ".*" + value.search + ".*", $options: "i"}
		})

		if(!result){
			throw new NotFoundException("Your search was not found")
		}

		return result
	}

	async insertMany(value: any) {
		const arrayId = value.id
		const now = new Date()
		const copy = `COPY-${StrToUnix(now)}`

		var found = await this.topicModel.find({ _id: { $in: arrayId } })
		for(let i in found){
			found[i]._id = new ObjectId()
			found[i].name = `${found[i].name}-${copy}`
			found[i].slug = `${found[i].slug}-${copy}`
		}

		try {
			return await this.topicModel.insertMany(found);
		} catch (e) {
			throw new NotImplementedException(`error when insert`);
		}
	}

	async topicCountList() {
        const topic = await this.topicModel.find()

        var count = new Array()
        var result = new Array()
        for(let i in topic){
            count[i] = {
                product: await this.productModel.find({ "topic": topic[i]._id }).countDocuments(),
                blog: await this.contentModel.find({isBlog: true, "topic": topic[i]._id }).countDocuments(),
                fulfillment: await this.contentModel.find({isBlog: false, "topic": topic[i]._id }).countDocuments()
            }

            result[i] = {
                topic: topic[i],
                count: count[i]
            }
        }
        return result
	}
	
	async topicRating(input: any, user_id: any) {
		input.kind = "category"
		input.rate.user_id = user_id
		const ratingCheck = await this.ratingService.storeCheck(input)

		if(!ratingCheck){
			const query = await this.ratingService.push(input)

			await this.topicModel.findByIdAndUpdate(input.kind_id, {rating_id: query.rating_id})
		}

		return 'Success add rating'
    }
}
