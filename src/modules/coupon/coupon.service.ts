import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { ICoupon } from './interfaces/coupon.interface';
import { OptQuery } from 'src/utils/OptQuery';
import { RandomStr } from 'src/utils/StringManipulation';
import { IProduct } from '../product/interfaces/product.interface';
import { IPaymentMethod } from '../payment/method/interfaces/payment.interface';
import { StrToUnix } from 'src/utils/StringManipulation';
import { TagService } from '../tag/tag.service';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class CouponService {

	constructor(
		@InjectModel('Coupon') private readonly couponModel: Model<ICoupon>,
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
		@InjectModel('PaymentMethod') private readonly paymentMethodModel: Model<IPaymentMethod>,
		private readonly tagService: TagService
	) {}

	private async findAggregate(query:any) {
		return await this.couponModel.aggregate([ 
			{ $match: query },
			{ $lookup: {
                		from: 'payment_methods',
                		localField: 'payment_method',
                		foreignField: '_id',
               			as: 'payment_method_info'
            		}},
            		{ $unwind: {
                		path: '$payment_method_info',
                		preserveNullAndEmptyArrays: true
            		}},
        		{ $lookup: {
                		from: 'products',
                		localField: 'product_id',
                		foreignField: '_id',
                		as: 'product_info'
            		}},
            		{ $unwind: {
                		path: '$product_info',
                		preserveNullAndEmptyArrays: true
            		}},
        		{ $lookup: {
                		from: 'tags',
                		localField: 'tag',
                		foreignField: '_id',
                		as: 'tag'
            		}},
            		{ $unwind: {
                		path: '$tag',
                		preserveNullAndEmptyArrays: true
            		}},
        		{ $addFields: {
                		is_active: { $cond: {
                    			if: { $gte: ["$end_date", new Date()] },
                    			then: true,
                    			else: false
                		}}
            		}},
        		{ $project: {
                		name: 1,
                		code: 1,
                		value: 1,
                		start_date: 1,
                		end_date: 1,
                		max_discount: 1,
                		payment_method: 1,
                		type: 1,
                		product_id: 1,
                		"product_info._id":1,
                		"product_info.name":1,
                		"product_info.slug":1,
               			"product_info.type":1,
                		"product_info.visibility":1,
                		"payment_method_info._id":1,
                		"payment_method_info.name":1,
                		"payment_method_info.info":1,
                		"payment_method_info.vendor":1,
                		"payment_method_info.isActive":1,
                		tag: 1,
                		is_active: 1,
                		created_at: 1
            		}},
        		{ $sort : { created_at: -1 }}
		])
	}

	private async findOne(field, value) {
		try {
			const query = await this.couponModel.findOne({ [field]: value })
			
			if(!query){
				throw new NotFoundException('coupon not found')
			}

			return query
		} catch (error) {
			throw new BadRequestException('Invalid coupon id / code format')
		}
	}

	async create(input: any) {
		// Check if Coupon name is already exist
        const isCouponNameExist = await this.couponModel.findOne({ name: input.name });
		
		if (isCouponNameExist) {
			throw new BadRequestException('That Coupon name is already exist.');
		}

		input.code = RandomStr(7)

		// Check if Coupon code is already exist
		const isCouponCodeExist = await this.couponModel.findOne({ code: input.code });
		
		if (isCouponCodeExist) {
			throw new BadRequestException('That Coupon code is already exist.');
		}

		if(input.type === 'Payment'){

			if(!input.payment_method){
				throw new BadRequestException('if type is "Payment". payment_method is required')
			}

			var checkPM
			try {
				checkPM = await this.paymentMethodModel.findById(input.payment_method)
			} catch (error) {
				throw new NotImplementedException('payment method id is wrong')
			}

			if(!checkPM){
				throw new NotFoundException('payment method not found')
			}
			input.product_id = null
		}else if(input.type === 'Product'){
			if(!input.product_id){
				throw new BadRequestException('if type is "Product". product_id is required')
			}

			var checkProduct
			try {
				checkProduct = await this.productModel.findById(input.product_id)
			} catch (error) {
				throw new NotImplementedException('product id is wrong')
			}

			if(!checkProduct){
				throw new NotFoundException('product not found')
			}
			input.payment_method = null
		}else{
			input.product_id = null
			input.payment_method = null
		}
		
		const createCoupon = new this.couponModel(input);

		if(input.tag && input.tag.length >= 1){
			const tags = input.tag.map(tag => {
				const tagObj = {name: tag, coupon: createCoupon._id}
				return tagObj
			})
			
			const hashtag = await this.tagService.insertMany(tags)
			createCoupon.tag = [hashtag.map(val => val._id)]
		}

		return await createCoupon.save();
	}

	async findAll(options: OptQuery) {
		var match = {}

		if (options.fields){
			
			if(options.value === 'true'){
			   options.value = true
			}

			if(options.value === 'false'){
			   options.value = false
			}

			match = { [options.fields]: options.value }
		}


		const query = await this.findAggregate(match)

		return query
	}

	async findById(id: string) {
		const match = { _id: ObjectId(id) }
		const query = await this.findAggregate(match)

		return (query.length >= 1) ? query[0] : {}
	}

	async updateById(id: string, input: any) {
		let result;
		
		// Check ID
		try{
		    result = await this.couponModel.findById(id);
		}catch(error){
		    throw new NotFoundException(`Could nod find Coupon with id ${id}`);
		}

		if(!result){
			throw new NotFoundException(`Could nod find Coupon with id ${id}`);
		}

		const {name} = input

		if(name){
			// Check if Coupon name is already exist
			const isCouponExist = await this.couponModel.findOne({ _id: { $ne: result._id }, name: name });

			if (isCouponExist != null) {
				throw new BadRequestException('That Coupon name is already exist.');
			}
		}

		if (input.type) {
			if (input.type === 'Payment') {
				var checkPM
				try {
					checkPM = await this.paymentMethodModel.findById(input.payment_method)
				} catch (error) {
					throw new NotImplementedException('payment method id is wrong')
				}

				if(!checkPM){
					throw new NotFoundException('payment method not found')
				}
				input.product_id = null
			}else if (input.type === 'Product') {
				var checkProduct
				try {
					checkProduct = await this.productModel.findById(input.product_id)
				} catch (error) {
					throw new NotImplementedException('product id is wrong')
				}

				if(!checkProduct){
					throw new NotFoundException('product not found')
				}

				input.payment_method = null
			}else{
				input.product_id = null
				input.payment_method = null
			}
		}
		
		try {
			await this.couponModel.findByIdAndUpdate(id, input);
			return await this.couponModel.findById(id);
		} catch (error) {
			throw new Error(error)	
		}
	}

	async delete(id: string) {
		try{
			await this.couponModel.findByIdAndRemove(id).exec();
			return 'ok';
		}catch(err){
			throw new NotImplementedException('The Coupon could not be deleted');
		}
	}

	async deleteMany(arrayId: any) {
		try{
			await this.couponModel.deleteMany({ _id: {$in: arrayId} });
			return 'ok';
		}catch(err){
			throw new NotImplementedException('The Coupon could not be deleted');
		}
	}

	async search(value: any) {
		const result = await this.couponModel.find({ $text: { $search: value.search } })

		if(!result){
			throw new NotFoundException("Your search was not found")
		}

		return result
	}

	async insertMany(value: any) {
		const arrayId = value.id
		const now = new Date()
		const copy = `COPY-${StrToUnix(now)}`

		var found = await this.couponModel.find({ _id: { $in: arrayId } })
		
		for(let i in found){
			found[i]._id = new ObjectId()
			found[i].name = `${found[i].name}-${copy}`
			found[i].code = RandomStr(7)
		}

		//try {
			return await this.couponModel.insertMany(found);
		//} catch (e) {
		//	throw new NotImplementedException(`The coupon could not be cloned`);
		//}
	}

	async findByCode(code: string) {
		const match = { code: code }
		const query = await this.findAggregate(match)

		return (query.length >= 1) ? query[0] : {}
	}
	
	async calculate(code: string, price: number){
        const coupon = await this.findByCode(code)
        var value = coupon.value * price / 100

        if(value > coupon.max_discount){
            value = coupon.max_discount
        }

        return { coupon, value }
    }
}
