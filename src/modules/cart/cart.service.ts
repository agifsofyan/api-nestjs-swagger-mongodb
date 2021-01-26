import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICart } from './interfaces/cart.interface';
import { IProduct } from '../product/interfaces/product.interface';
import { filterByReference } from 'src/utils/StringManipulation';

@Injectable()
export class CartService {
    constructor(
		@InjectModel('Cart') private readonly cartModel: Model<ICart>,
		@InjectModel('Product') private readonly productModel: Model<IProduct>
    ) {}

    async add(user: any, input: any) {
		const userId = user._id

		const getProduct = await this.productModel.find({ _id: { $in: input.product_id } })
		if(getProduct.length !== input.product_id.length){
			throw new NotFoundException(`product not found`)
		}

		input.product_id = input.product_id.map(item => {
			const itemObj = { product_info: item }
			return itemObj
		})

		var cart = await this.cartModel.findOne({user_info: userId})
		
		var msgItem = 'items inserted'

		if(cart){
			var itemsList = new Array()
			for(let i in cart.items){
				itemsList[i] = { product_info: (cart.items[i].product_info).toString() }
			}

			const exsistItem = filterByReference(itemsList, input.product_id, 'product_info', 'product_info', true)

			if(exsistItem.length > 0){
				for(let i in exsistItem){
					const index = cart.items.findIndex((item) => {
						return item.product_info.equals(exsistItem[i].product_info);
					});
					cart.items[index].quantity += 1
				}

				msgItem = 'successful, with an existing product'
			}

			const unExixtitems = filterByReference(input.product_id, itemsList, 'product_info', 'product_info', false)
			cart.items.push(...unExixtitems)
		}else{
			cart = new this.cartModel({
				user_info: userId,
				items: input.product_id
			})
		}

		await cart.save()

		return {
			result: await this.cartModel.findOne({user_info: userId}),
			msg: msgItem
		}
   }

    async getMyItems(user: any) {
		const userId = user._id

		var cart = await this.cartModel.aggregate([
			{$match: { "user_info._id":userId }},
			{$sort: {modifiedOn: -1}}
		]).then(res => res)

		if(cart.length <= 0){
			const query = new this.cartModel({ user_info: userId })
			return await query.save()
		}else{
			cart.map(c => {
				const checkItem = c.items.find(item => item.product_info._id)
				if(checkItem === undefined){
					c.items = []
				}

				return c
			})

			return cart[0]
		}
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
