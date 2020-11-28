import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IContent } from './interfaces/content.interface';
import { OptQuery } from 'src/utils/OptQuery';

import { TopicService } from '../topic/topic.service';
import { ProductService } from '../product/services/product.service';
import { ProductCrudService } from '../product/services/product.crud.service';

@Injectable()
export class ContentService {

	constructor(
		@InjectModel('Content') private readonly contentModel: Model<IContent>,
		private readonly topicService: TopicService,
		private readonly productService: ProductService,
		private readonly productCrudService: ProductCrudService,
	) {}

	async create(createContentDto: any): Promise<IContent> {
		const createContent = new this.contentModel(createContentDto);

		// Check if content name is already exist
        const isContentNameExist = await this.contentModel.findOne({ name: createContent.name });
        	
		if (isContentNameExist) {
        	throw new BadRequestException('That content name is already exist.');
		}

		var arrayProduct = (!createContentDto.product) ? [] : createContentDto.product
		
		if(arrayProduct.length >= 1){
		    for (let i = 0; i < arrayProduct.length; i++) {
			const isProductExist = await this.productCrudService.findById(arrayProduct[i])
				if (! isProductExist) {
					throw new NotFoundException('Product not found')
				}
		    }
		}

		var arrayTopic = createContentDto.topic

		for (let i = 0; i < arrayTopic.length; i++) {
			const isTopicExist = await this.topicService.findById(arrayTopic[i])
			if (! isTopicExist) {
				throw new NotFoundException('Topic not found')
			}
		}

		return await createContent.save();
	}

	async findAll(options: OptQuery): Promise<IContent[]> {
		const offset = (options.offset == 0 ? options.offset : (options.offset - 1));
		const skip = offset * options.limit;
		const sortval = (options.sortval == 'asc') ? 1 : -1;

		if (options.sortby){
			if (options.fields) {

				return await this.contentModel
					.find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ [options.sortby]: sortval })
			} else {

				return await this.contentModel
					.find()
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ [options.sortby]: sortval })
			}
		}else{
			if (options.fields) {

				return await this.contentModel
					.find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ 'updated_at': 'desc' })
			} else {

				return await this.contentModel
					.find()
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ 'updated_at': 'desc' })
			}
		}
	}

	async findById(id: string): Promise<IContent> {
	 	let data;
		try{
		    data = await this.contentModel.findOne({ _id: id})
		}catch(error){
		    throw new NotFoundException(`Could nod find content with id ${id}`);
		}

		if(!data){
			throw new NotFoundException(`Could nod find content with id ${id}`);
		}

		return data;
	}

	async update(id: string, updateContentDto: any): Promise<IContent> {
		let data;
		
		// Check ID
		try{
		    data = await this.contentModel.findById(id);
		}catch(error){
		    throw new NotFoundException(`Could nod find content with id ${id}`);
		}

		if(!data){
			throw new NotFoundException(`Could nod find content with id ${id}`);
		}

		if(updateContentDto.product){
		   for (let i in updateContentDto.product) {
			const isProductExist = await this.productCrudService.findById(updateContentDto.product[i])
			if (! isProductExist) {
				throw new NotFoundException(`Product in order of ${i} not found`)
			}
		   }
		}
		
		if(updateContentDto.topic) {
			for (let i in updateContentDto.topic) {
				const isTopicExist = await this.topicService.findById(updateContentDto.topic[i])
				if (! isTopicExist) {
					throw new NotFoundException(`Product in order of ${i} not found`)
				}
			}
		}

		try {
			await this.contentModel.findByIdAndUpdate(id, updateContentDto);
			return await this.contentModel.findById(id);
		} catch (error) {
			throw new Error(error)	
		}
	}

	async delete(id: string): Promise<string> {
		try{
			await this.contentModel.findByIdAndRemove(id).exec();
			return 'ok';
		}catch(err){
			throw new NotImplementedException('The content could not be deleted');
		}
	}

	async deleteMany(arrayId: any): Promise<string> {
		try {
			await this.contentModel.deleteMany({ _id: { $in: arrayId } });
			return 'ok';
		} catch (err) {
			throw new NotImplementedException('The content could not be deleted');
		}
	}

	async search(value: any): Promise<IContent[]> {
		const result = await this.contentModel.find({ $text: { $search: value.search } })

		if (!result) {
			throw new NotFoundException("Your search was not found")
		}

		return result
	}
}
