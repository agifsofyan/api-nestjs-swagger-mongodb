import { Injectable, BadRequestException, NotFoundException, BadGatewayException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { ICart } from './interfaces/cart.interface';
import { IProduct } from '../product/interfaces/product.interface';
import { ArrStrToObjectId, onArray } from 'src/utils/StringManipulation';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class CartService {
    constructor(
		@InjectModel('Cart') private readonly cartModel: Model<ICart>,
		@InjectModel('Product') private readonly productModel: Model<IProduct>
    ) {}

    async add(user: any, input: any) {
		const userId = user._id

		const getProduct = await this.productModel.find({ _id: { $in: input } })
		
		if(getProduct.length !== input.length){
			throw new NotFoundException(`product not found`)
		}

		input = input.map(item => {
			const itemObj = { product_info: ObjectId(item) }
			return itemObj
		})

		var cart = await this.cartModel.findOne({user_info: userId})

		var itemsList = new Array()
		for(let i in cart.items){
			itemsList[i] = cart.items[i].product_info
		}
		
		if(cart){
			
			// if(cart.items.length >= 1){
					
			// 	const exo = itemsList.filter((el) => input.indexOf(el.product_info) === -1)
			// 	console.log('exo', exo)

			// 	await this.cartModel.findOneAndUpdate(
			// 		{ user_info: userId },
			// 		{
			// 			$pull: { items: { product_info: { $in: exo } } },
			// 		},
			// 		{upsert: true, new: true, runValidators: true}
			// 	)
			// }
			
			cart.items.push(...input)
			await cart.save()
			
		}else{
			cart = new this.cartModel({
				user_info: userId,
				items: input
			})
			await cart.save()
		}

		return await this.cartModel.findOne({user_info: userId})
   }

    async getMyItems(user: any) {
		const userId = user._id

		const cart = await this.cartModel.aggregate([
			{$match: { "user_info._id":userId }},
			{$sort: {modifiedOn: -1}}
		]).then(res => {
			const itemsLength = res[0].items.map(el => el.product_info)
			// console.log('itemsLength', itemsLength._id)
			if(itemsLength._id === undefined){
				res[0].items = []
			}

			return res
		})

		// console.log('cart', cart)

		if(cart.length <= 0){
			const query = new this.cartModel({ user_info: userId })
			return await query.save()
			// return query
		}

		return cart[0]
	}

    async purgeItem(user: any, productId: any){
		const userId = user._id

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
