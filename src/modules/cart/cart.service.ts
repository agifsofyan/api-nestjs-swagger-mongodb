import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { ICart, IItemCart } from './interfaces/cart.interface';
import { IProduct } from '../product/interfaces/product.interface';
import { ProfileService } from '../profile/profile.service';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class CartService {
    constructor(
		@InjectModel('Cart') private readonly cartModel: Model<ICart>,
		@InjectModel('CartItem') private readonly itemModel: Model<IItemCart>,
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
		private readonly profileService: ProfileService
    ) {}

    async add(user: any, productId: string): Promise<ICart> {
		if(!productId){
			throw new BadRequestException('param of product_id is required')
		}

		const getProduct = await this.productModel.findById(productId)

		if(!getProduct){
			throw new NotFoundException(`product with id ${productId} not found`)
		}

		var sub_price = getProduct.price

		if(getProduct.sale_price > 0){
			sub_price = getProduct.sale_price
		}

	    let userId = null
	    if(user != null){
	        userId = user._id
		}
		
		let items = await new this.itemModel({ product_info: productId, isActive: true, sub_price: sub_price })

		let cart = await this.cartModel.findOne({ user_info: userId })

	    if (!cart) {
		    cart = await new this.cartModel({ user_info: userId })
		}

		const checkProduct = cart.items.filter((item) => item.product_info == productId)

		if (checkProduct.length == 0){
			cart.items.unshift(items);
			return await cart.save();
		}
		
		return cart
   }

    async getMyItems(user: any) {
		let userId = null
		if (user != null) {
			userId = user._id
		}

		var query = await this.cartModel.findOne({ user_info: userId })
		
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
