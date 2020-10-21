import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { ICart, IItemCart } from './interfaces/cart.interface';
import { IProduct } from '../product/interfaces/product.interface';
import { IOrder } from '../order/interfaces/order.interface';
import { addCartDTO, modifyCartDto } from './dto/cart.dto';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class CartService {
    constructor(
		@InjectModel('Cart') private readonly cartModel: Model<ICart>,
		@InjectModel('CartItem') private readonly itemModel: Model<IItemCart>,
        @InjectModel('Product') private readonly productModel: Model<IProduct>,
        @InjectModel('Product') private readonly orderModel: Model<IOrder>
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
	        userId = user.userId
		}
		
		let items = await new this.itemModel({ product_id: productId, isActive: true, sub_price: sub_price })

		let cart = await this.cartModel.findOne({ user_id: userId })

	    if (!cart) {
		    cart = await new this.cartModel({ user_id: userId })
		}

		const checkProduct = cart.items.filter((item) => item.product_id == productId)

		if (checkProduct.length == 0){

			cart.items.unshift(items);
			console.log('save 2', cart)
			return await cart.save();
		}
		
		return cart
   }

    async getMyItems(user: any) {
		let userId = null
		if (user != null) {
			userId = user.userId
		}

		const query = await this.cartModel.aggregate([
			{
				$match: { user_id: ObjectId(userId) }
			},
			{
				$lookup: {
					from: 'users',
					localField: 'user_id',
					foreignField: '_id',
					as: 'user_info'
				}
			},
			{
				$unwind: {
					path: '$user_info',
					preserveNullAndEmptyArrays: true
				}
			},
			{ $project: {
				user_id: 1,
				"user_info.name": 1,
				"user_info.email": 1,
				"user_info.phone_number": 1,
				items: {
					$filter: {
						input: '$items',
						as: 'items',
						cond: { $eq: ['$$items.isActive', true] },
					},
				},
			}},
			{ $addFields: {
				items: { $map: {
					input: "$items",
					as: "items",
					in: {
						_id: "$$items._id",
						product_id: "$$items.product_id",
						variant: "$$items.variant",
						quantity: "$$items.quantity",
						note: "$$items.note",
						shipment_id: "$$items.shipment_id",
						whenAdd: "$$items.whenAdd",
						whenExpired: "$$items.whenExpired",
						coupon_id: "$$items.coupon_id",
						status: { $cond: {
							if: { $gte: ["$$items.whenExpired", new Date()] },
							then: "active",
							else: "expired"
						}}
					}
				}}
			}},
			{
				$unwind: {
					path: '$items',
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: 'products',
					localField: 'items.product_id',
					foreignField: '_id',
					as: 'items.product_info'
				}
			},
			{
				$unwind: '$items.product_info'
			},
			{ 
				$group: {
					_id: "$_id",
					user_info:{ $first: "$user_info" },
					items: { $push: "$items" },
					qty: { $sum: {
						$cond: {
							if: { $eq: ["$items.status", "active"] },
							then: '$items.quantity',
							else: 0
						}
					}},
					total: { 
						$sum: {
							$cond: {
								if: { $lt: ["$items.product_info.sale_price", 0] },
								then: { $multiply: ['$items.product_info.sale_price', '$items.quantity'] },
								else: { $multiply: ['$items.product_info.price', '$items.quantity'] },
							}
						} 
					}
				}
			}
		])

        return await query
	}
	
	async store(user: any, input: any){
		let userId = null
		if (user != null) {
			userId = user.userId
		}

		var newOrder = await new this.orderModel()
		// await newOrder.save()

		var productIdArray = new Array()
		for(let i in input){
			productIdArray[i] = input[i].product_id

			await this.cartModel.findOneAndUpdate(
				{ user_id: userId },
				{
					$pull: { items: { product_id: input[i].product_id } }
				}
			);

			input[i].whenOrder = new Date()
			input[i].order_id = newOrder._id
		}

		console.log('input', input)

		const pushCart = await this.cartModel.findOneAndUpdate(
			{ user_id: userId },
			{
				$push: { items: input }
			}
		);
		console.log('pushCart', pushCart)

		const getProduct = await this.productModel.find({
			_id: { $in: productIdArray }
		})

		for(let e in getProduct){
			if(getProduct && getProduct[e].type == 'ecommerce'){
				let obj = input.find(obj => obj.product_id == getProduct[e]._id);
				await this.productModel.findOneAndUpdate(
					{ _id: getProduct[e]._id },
					{ $set: { "ecommerce.stock": ( getProduct[e].ecommerce.stock - obj.quantity ) } }
				)
			}
		}

		return await this.cartModel.find({ user_id: userId })
	}

    async purgeItem(user: any, productId: any){
		let userId = null
		if (user != null) {
			userId = user.userId
		}
		
		for(let i in productId){
			await this.cartModel.findOneAndUpdate(
				{ user_id: userId },
				{
					$pull: { items: { product_id: productId[i] } }
				}
			);
		}

		const getEcommerce = await this.productModel.find({
			_id: { $in: productId }
		})

		for(let e in getEcommerce){
			if(getEcommerce[e].type == 'ecommerce'){
				let obj = productId.find(obj => obj == getEcommerce[e]._id);
				// console.log('obj', obj)
				await this.productModel.findOneAndUpdate(
					{ _id: getEcommerce[e]._id },
					{ $set: { "ecommerce.stock": ( getEcommerce[e].ecommerce.stock + obj.quantity ) } }
				)
			}
		}

		return await this.cartModel.find({ user_id: userId })
	}
}
