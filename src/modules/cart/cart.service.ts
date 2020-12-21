import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { ICart } from './interfaces/cart.interface';
import { IProduct } from '../product/interfaces/product.interface';
import { ProfileService } from '../profile/profile.service';
import { expiring } from 'src/utils/order';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class CartService {
    constructor(
		@InjectModel('Cart') private readonly cartModel: Model<ICart>,
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
		private readonly profileService: ProfileService
    ) {}

    async add(user: any, input: any) {
		//let userId = null
	    //if(user != null){
			let userId = user._id
		//}

		const getProduct = await this.productModel.find({ _id: input })
		
		if(getProduct.length !== input.length){
			throw new NotFoundException(`product not found`)
		}

		const items = input.map(item => {
			const itemObj = { product_info: item }
			return itemObj
		})
		
		const cart = await this.cartModel.findOneAndUpdate(
			{ user_info: userId },
			{
				$push: {
					items: items
				},
				modifiedOn: new Date()
			},
			{ upsert: true, new: true, runValidators: true }
		)

		console.log('cart', cart)
		
		return cart
   }

    async getMyItems(user: any) {
		let userId = null
		if (user != null) {
			userId = user._id
		}

		// var query = await this.cartModel.findOne({ user_info: userId })
		const cart = await this.cartModel.aggregate([
			{$match: { "user_info._id": userId }}
		])

		var query = cart[0]

		if(!query){
			query = await new this.cartModel({ user_info: userId })
			query.save()
		}

		return {res: query, count: query.items.length}
	}

    async purgeItem(user: any, productId: any){
		let userId = null
		if (user != null) {
			userId = user._id
		}

		const getChart = await this.cartModel.findOne({ user_info: userId })

		if(!getChart){
			throw new NotFoundException('user not found')
		}

		var getEcommerce
		try {
			getEcommerce = await this.productModel.find({ _id: { $in: productId } })
			
			if(!getEcommerce){
				throw new NotFoundException(`product id not found`)
			}
		} catch (error) {
			throw new BadRequestException('Product id not valid format')
		}
		
		const isArray = productId instanceof Array
		if(!isArray){
			productId = [productId]
		}

		await this.cartModel.findOneAndUpdate(
			{ user_info: userId },
			{
				$pull: { items: { product_info : { $in: productId } } }
			}
		);

		return await this.cartModel.findOne({ user_info: userId })
	}
}
