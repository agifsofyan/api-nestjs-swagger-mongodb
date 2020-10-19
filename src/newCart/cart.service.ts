import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { ICart, IItemCart } from './interfaces/cart.interface';
import { IProduct } from '../product/interfaces/product.interface';
import { IUser } from '../user/interfaces/user.interface';
import { addCartDTO, modifyCartDto } from './dto/cart.dto';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class CartService {
    constructor(
		@InjectModel('Cart') private readonly cartModel: Model<ICart>,
		@InjectModel('CartItem') private readonly itemModel: Model<IItemCart>,
        @InjectModel('Product') private readonly productModel: Model<IProduct>,
        @InjectModel('User') private readonly userModel: Model<IUser>
    ) {}

    async add(user: any, productId: string): Promise<ICart> {
		if(!productId){
			throw new BadRequestException('param of product_id is required')
		}

		if(productId && !await this.productModel.findById(productId)){
			throw new NotFoundException(`product with id ${productId} not found`)
		}

	    let userId = null
	    if(user != null){
	        userId = user.userId
	    }

		const unixTime = Math.floor(Date.now() / 1000);
		const duration = (31 * 3600 * 24)
		const expired =  unixTime + duration
		const expDate = new Date(expired * 1000)

		let checkCar = await this.cartModel.findOne({ user_id: userId })

	    if (!checkCar) {
		    let cart = await new this.cartModel({ user_id: userId })

			console.log('!cart', cart)

			let items = await new this.itemModel({ product_id: productId, whenExpired: expDate })

			cart.items.unshift(items);
			return await cart.save();
	    }else{
			const cart = await this.cartModel
			.findOneAndUpdate(
				{ user_id: userId },
				{
					$set: { modifiedOn: new Date() }
				}
			);

			const checkProduct = checkCar.items.filter((item) => item.product_id == productId)

			console.log('checkProduct', checkProduct)

			if (checkProduct.length == 0){

				let items = await new this.itemModel({ product_id: productId, whenExpired: expDate, isActive: true })

				cart.items.unshift(items);
				return await cart.save();
			}else{
				return cart
			}
	    }

		return await this.cartModel.findOne({user: userId})
   }

    async getMyItems(user: any) {
		const now = Date.now

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
								if: { $lt: ["$items.product_info.sale", 0] },
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

    async getByUserId(){}

    async purgeItem(){}
}

// console.log('checkCart1', checkCart)

        // let cart = new Object()
        
        // if(!checkCart){
        //     cart = {
        //         user: userId,
        //         items: [{product: addCartDTO.id}]
        //     }
        //     checkCart = new this.cartModel(cart)
        // }

        // console.log('checkCart2', checkCart)

        // // console.log('cart', cart)

        // const productFilter = checkCart.items.filter((item: any) => item.product === String(addCartDTO));
        // console.log('productFiler', productFilter)
