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

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class CouponService {

	constructor(@InjectModel('Coupon') private readonly couponModel: Model<ICoupon>) {}

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

	async create(createCouponDto: any) {
		createCouponDto.code = RandomStr(7)
		const createCoupon = new this.couponModel(createCouponDto);
		
		// Check if Coupon name is already exist
        const isCouponNameExist = await this.couponModel.findOne({ name: createCoupon.name });
		
		if (isCouponNameExist) {
			throw new BadRequestException('That Coupon name is already exist.');
		}

		// Check if Coupon code is already exist
		const isCouponCodeExist = await this.couponModel.findOne({ code: createCoupon.code });
		
		if (isCouponCodeExist) {
			throw new BadRequestException('That Coupon code is already exist.');
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

		const query = await this.couponModel.aggregate([
			{
			   $addFields: {
				is_active: { $cond: {
				    if: { $gte: ["$end_date", new Date()] },
				    then: true,
				    else: false
				}}
			   }
			},
			{
			   $match: match
			}
		])

		return query
	}

	async findById(id: string) {
		await this.findOne("_id", ObjectId(id))
		const query = await this.couponModel.aggregate([
			{
				$match: { _id: ObjectId(id) }
			},
			{
			   $addFields: {
				is_active: { $cond: {
				    if: { $gte: ["$end_date", new Date()] },
				    then: true,
				    else: false
				}}
			   }
			}
		])

		return (query.length >= 1) ? query[0] : {}
	}

	async updateById(id: string, updateCouponDto: any) {
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

		const {name} = updateCouponDto

		if(name){
			// Check if Coupon name is already exist
			const isCouponExist = await this.couponModel.findOne({ name: name });

			if (isCouponExist && isCouponExist._id != id && isCouponExist.name == name) {
				throw new BadRequestException('That Coupon name is already exist.');
			}
		}

		
		try {
			await this.couponModel.findOneAndUpdate({_id:id}, updateCouponDto);
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

		var found = await this.couponModel.find({ _id: { $in: arrayId } })
		
		for(let i in found){
			found[i]._id = new ObjectId()
			found[i].name = `${found[i].name}-COPY`
			found[i].name = RandomStr(7)
		}

		try {
			return await this.couponModel.insertMany(found);
		} catch (e) {
			throw new NotImplementedException(`The coupon could not be cloned`);
		}
	}

	async findByCode(code: string) {
		await this.findOne("code", code)
		const query = await this.couponModel.aggregate([
			{
				$match: { code: code }
			},
			{
			   $addFields: {
				is_active: { $cond: {
				    if: { $gte: ["$end_date", new Date()] },
				    then: true,
				    else: false
				}}
			   }
			},
		])

		return (query.length >= 1) ? query[0] : {}
	}
	
	async calculate(code: string, price: number){
        const coupon = await this.findByCode(code)

        var value = (coupon.value / 100) * price

        if(value > coupon.max_discount){
            value = coupon.max_discount
        }

        return { coupon, value }
    }
}
