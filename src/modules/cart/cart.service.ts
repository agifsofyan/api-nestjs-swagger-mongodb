import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { ICart } from './interfaces/cart.interface';
import { IProduct } from '../product/interfaces/product.interface';
import { filterByReference } from 'src/utils/helper';

const ObjectId = mongoose.Types.ObjectId;

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

		getProduct.map(async(product) => {
			if(product.type == 'ecommerce'){
				if(product.ecommerce.stock <= 0){
					throw new BadRequestException('ecommerce stock is empty')
				}

				await this.productModel.findByIdAndUpdate(
					product._id,
					{ "ecommerce.stock": product.ecommerce.stock - 1 }
				)
			}
		})

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

		var cart = await this.cartModel.findOne({ user_info: userId })

		if(!cart){
			cart = new this.cartModel({ user_info: userId })
			await cart.save()
		}

		var result = await this.cartModel.aggregate([
		{$match: { user_info: ObjectId(userId) }},
		{$lookup: {
            		from: 'users',
            		localField: 'user_info',
            		foreignField: '_id',
            		as: 'user_info'
        	}},
        	{$unwind: {
            		path: '$user_info',
            		preserveNullAndEmptyArrays: true
        	}},
        	{$unwind: {
            		path: '$items',
            		preserveNullAndEmptyArrays: true
        	}},
        	{$lookup: {
            		from: 'products',
            		localField: 'items.product_info',
            		foreignField: '_id',
            		as: 'items.product_info'
        	}},
        	{$unwind: {
            		path: '$items.product_info',
            		preserveNullAndEmptyArrays: true
        	}},
        	{$lookup: {
            		from: 'topics',
            		localField: 'items.product_info.topic',
            		foreignField: '_id',
            		as: 'items.product_info.topic'
        	}},
        	{$lookup: {
            		from: 'administrators',
            		localField: 'items.product_info.agent',
            		foreignField: '_id',
            		as: 'items.product_info.agent'
        	}},
        	{$addFields: {
            		"items.status": { $cond: {
           	     		if: { $gte: ["$items.whenExpired", new Date()] },
                		then: "ACTIVE",
                		else: "EXPIRED"
            		}}
        	}},
        	{$project: {
            		"user_info._id":1,
            		"user_info.name":1,
            		"user_info.email":1,
            		"items._id":1,
            		"items.quantity": 1,
            		"items.whenExpired": 1,
            		"items.product_info._id":1,
            		"items.product_info.name":1,
            		"items.product_info.slug":1,
            		"items.product_info.code":1,
            		"items.product_info.type":1,
            		"items.product_info.price":1,
            		"items.product_info.sale_price":1,
            		"items.product_info.bump":1,
                        "items.utm": 1,
            		"items.status": 1
        	}},
        	{$group: {
            		_id: "$_id",
            		user_info:{ $first: "$user_info" },
            		items: { $push: "$items" }
        	}},
		{$sort: {modifiedOn: -1}}
		]).then(res => res.length > 0 ? res[0] : {})

		var cartItems = []

		result.items.forEach(el => {
			if(el.product_info._id){
				cartItems.push(el)
			}
		});
		
		result.items = cartItems
		return result
	}

	private async getProduct(product_id: string) {
		try {
			return await this.productModel.findById(product_id)
		} catch (error) {
			throw new NotFoundException(`product with id ${product_id} not found`)
		}
	}

    async purgeItem(user: any, productId: any){
		const userId = user._id
		const isArray = productId instanceof Array
		if(!isArray) productId = [productId];

		var cart = await this.cartModel.findOne({ user_info: userId })

		if(!cart) throw new NotFoundException('cart not found')
		if(cart.items.length == 0) throw new NotFoundException('cart is empty')

		Promise.all(productId.map(async(productID) => {
			const product = await this.getProduct(productID)
			const cartItem = cart.items.filter(res => res.product_info.toString() == productID)

			if(product.type == 'ecommerce' && cartItem.length > 0){
				await this.productModel.findByIdAndUpdate(
					productID, 
					{ $inc: { "ecommerce.stock": cartItem[0].quantity} }
				)
			}

		}))
		
		await this.cartModel.findOneAndUpdate(
			{ user_info: userId },
			{
				$pull: { items: { product_info : { $in: productId } } }
			}
		);

		return await this.cartModel.findOne({ user_info: user._id })
	}
}
