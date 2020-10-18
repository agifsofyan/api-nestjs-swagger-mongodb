import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { ICart, IItemCart } from './interfaces/cart.interface';
import { IProduct } from '../product/interfaces/product.interface';
import { IUser } from '../user/interfaces/user.interface';
import { addCartDTO, modifyCartDto } from './dto/cart.dto';

import { CartSchema } from './schema/cart.schema';

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

		// console.log('userId', userId)
	
		// const query = await this.cartModel.aggregate([
		// { $match: { "user_id": ObjectId(userId) } },
		// {
		//     $lookup: {
		// 		from: 'users',
		// 		localField: 'user_id',
		// 		foreignField: '_id',
		// 		as: 'user_info'
		//     },
		// },
		// {
		// 	$unwind: "$user_info"
		// },
		// {
		//    	$unwind: "$items"
		// },
		// {
		//    	$lookup: {
		// 		from: 'products',
		// 		localField: 'items.product_id',
		// 		foreignField: '_id',
		// 		as: 'items.product'
		//    	}
		// },
		// {
		//    	$unwind: "$items.product"
		// },
	// 	{
	// 		$addFields: {
	// 			items: {
	// 				$map: {
	// 					input: "$items",
	// 					as: "items",
	// 					"in": {
	// 						"_id": "$$items._id",
	// 						"quantity": 1,
	// 						// "product": "$$items.product",
	// 						"whenAdd": "$$items.whenAdd",
	// 						"whenExpired": "$$items.whenExpired",
	// 						"status": {
	// 							$cond: {
	// 								"if": {
	// 									$gte: ["$$items.whenExpired", new Date()]
	// 								},
	// 								"then": "active",
	// 								"else": "expired"
	// 							}
	// 						}
	// 					}
	// 				}
	// 			}
	// 		},
	// 	},
	// 	{
	// 		$project: {
	// 			"_id": 1,
	// 			"user_id": 1,
	// 			"user_info.name": 1,
	// 			"user_info.email": 1,
	// 			"user_info.phone_number": 1,
	// 			"items": {
	// 				$filter: {
	// 					input: '$items',
	// 					as: 'items',
	// 					cond: { $eq: ['$$items.isActive', true] },
	// 				},
	// 			}
	// 		},
	// 	},
	// ])

	// console.log(query)
	
	// return query

		const query = await this.cartModel.aggregate([
			{
				$match: { user_id: userId }
			},
			{
				$project: {
					"_id": 1,
					// "user_id": 1,
					// "user_info.name": 1,
					// "user_info.email": 1,
					// "user_info.phone_number": 1,
					"items": {
						$filter: {
							input: '$items',
							as: 'items',
							cond: { $eq: ['$$items.isActive', true] },
						},
					}
				},
			},
			{
				$addFields: {
					items: {
						$map: {
							input: "$items",
							as: "items",
							"in": {
								"_id": "$$items._id",
								"quantity": 1,
								"product_id": "$$items.product_id",
								"whenAdd": "$$items.whenAdd",
								"whenExpired": "$$items.whenExpired",
								"status": {
									$cond: {
										"if": {
											$gte: ["$$items.whenExpired", new Date()]
										},
										"then": "active",
										"else": "expired"
									}
								}
							}
						}
					}
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'user_id',
					foreignField: '_id',
					as: 'user_info'
				},
			},
			{
				$unwind: {
					path: "$user_info",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$unwind: {
					path: '$items'
				}
			},
			{
				$lookup: {
					from: 'products',
					localField: 'items.product_id',
					foreignField: '_id',
					as: 'product_info'
				}
			},
			{
				$unwind: {
					path: '$product_info',
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$group: {
					_id: "$_id",
					items: { $push: '$items' },
					qty: { $sum: '$items.quantity' },
					total: { $sum: { $multiply: ['$product_info.price', '$items.quantity'] } }
				}
			}
		]); //.exec( (err, result) => result[0] );

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
