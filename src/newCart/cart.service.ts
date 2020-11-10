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

		const checkCart = await this.cartModel.findOne({ user_id: userId })
		
		if(!checkCart){
			const newQuery = await new this.cartModel({ user_id: userId })
			newQuery.save()
		}

		const address = await this.profileService.getAddress(user)

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
				modifiedOn: 1
			}},
			{
				$lookup: {
					from: 'user_profiles',
					localField: 'user_id',
					foreignField: 'user_id',
					as: 'address'
				}
			},
			{
				$unwind: {
					path: '$address',
					preserveNullAndEmptyArrays: true
				}
			},
			{ $addFields: {
				items: { $map: {
					input: "$items",
					as: "items",
					in: {
						_id: "$$items._id",
						product_id: "$$items.product_id",
						// variant: "$$items.variant",
						quantity: "$$items.quantity",
						// note: "$$items.note",
						// shipment_id: "$$items.shipment_id",
						// whenAdd: "$$items.whenAdd",
						whenExpired: "$$items.whenExpired",
						coupon_id: "$$items.coupon_id",
						// sub_price: "$$items.sub_price",
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
			{ $project: {
				"user_id":1,
				"user_info":1,
				"items.product_info._id":1,
				"items.product_info.name":1,
				"items.product_info.slug":1,
				"items.product_info.code":1,
				"items.product_info.type":1,
				"items.product_info.visibility":1,
				"items.product_info.sale_method":1,
				"items.product_info.price":1,
				"items.product_info.sale_price":1,
				"items.product_info.created_by":1,
				"items.product_info.topic":1,
				"items.product_info.agent":1,
				"items.product_info.bump":1,
				"items.product_info.webinar":1,
				"items.product_info.ecommerce":1,
				"items.product_info.digital":1,
				"items.product_info.bonus":1,
				"items.product_info.image_bonus_url": 1,
				"items.product_info.media_url":1,
				"items.product_info.image_product_url":1,
				"items.product_info.image_url":1,
				"modifiedOn":1
			}},
			{ 
				$group: {
					_id: "$_id",
					user_info:{ $first: "$user_info" },
					items: { $push: "$items" },
					/**
					qty: { $sum: {
						$cond: {
							if: { $eq: ["$items.status", "active"] },
							then: '$items.quantity',
							else: 0
						}
					}},
					total: { 
						$sum: //"$items.sub_price"
						{
							$cond: {
								if: { $lt: ["$items.product_info.sale_price", 0] },
								then: { $multiply: ['$items.product_info.sale_price', '$items.quantity'] },
								else: { $multiply: ['$items.product_info.price', '$items.quantity'] },
							}
						}
					}
					*/
				}
			},
			{ $addFields: {
				"user_info.address": address
			}}
		])

		return query.length > 0 ? query[0] : await this.cartModel.findOne({ user_id: userId })
	}

    async purgeItem(user: any, productId: any){
		let userId = null
		if (user != null) {
			userId = user.userId
		}

		const getChart = await this.cartModel.findOne({ user_id: userId })

		if(!getChart){
			throw new NotFoundException('user not found')
		}

		const getEcommerce = await this.productModel.findOne({ _id: productId })

		if(!getEcommerce){
			throw new NotFoundException(`product id [${productId}] not found`)
		}

		getChart.items.map( async cart => {
			if(cart.product_id = getEcommerce._id){
				const up = await this.cartModel.findOneAndUpdate(
					{ user_id: userId },
					{
						$pull: { items: { product_id: cart.product_id } }
					}
				);
			}

			
		})

		return await this.cartModel.findOne({ user_id: userId })
	}

	async deleteMany(userId: string, arrayId: any) {
		const getChart = await this.cartModel.findOne({ user_id: userId })

		if(!getChart){
			throw new NotFoundException('user not found')
		}

		var getProduct 
		try{
		   getProduct = await this.productModel.find({ _id: { in: arrayId.product_id } })
		}catch(error){
		   throw new NotFoundException(`have not find product id in array`)
		}

		if(!getProduct){
		   throw new NotFoundException('have not find product id in array')
		}

		await this.cartModel.findOneAndUpdate(
			{ user_id: userId },
			{
				$pull: { "items.product_id": { in: arrayId.product_id } }
			}
		);

		return await this.cartModel.findOne({ user_id: userId })
	}
}
