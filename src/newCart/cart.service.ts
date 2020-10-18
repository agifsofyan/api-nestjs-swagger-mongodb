import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { ICart } from './interfaces/cart.interface';
import { IProduct } from '../product/interfaces/product.interface';
import { IUser } from '../user/interfaces/user.interface';
import { addCartDTO, modifyCartDto } from './dto/cart.dto';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class CartService {
    constructor(
        @InjectModel('Cart') private readonly cartModel: Model<ICart>,
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

        console.log('productId', productId)
	//console.log('addCartDTO.id', addCartDTO.id)

        let checkCar = await this.cartModel.findOne({
            user: userId
	})

	const unixTime = Math.floor(Date.now() / 1000);
	const duration = (31 * 3600 * 24)
	const expired =  unixTime + duration
	const expDate = new Date(expired * 1000) 


        if(!checkCar){
            let cart = new this.cartModel({
                user: userId,
                items: [{
		   product: productId,
		   whenExpired: expDate
		}],
	    })
            await cart.save()
        }else{
	    const items = checkCar.items
	    //console.log('items=', items)

	    const checkProduct = items.filter((item) => item.product == productId)

	    if(checkProduct.length == 0){

              await this.cartModel.findOneAndUpdate(
			{ user: userId },
                {
                 $push: { 
                    items: {
                        product: productId,
                        variant: null,
                        qty: 1,
                        note: null,
                        shipment: '',
			whenAdd: new Date(),
			whenExpired: expDate,
                        isActive: true
                    }
                  }
                },
			{ new: true, upsert: true }
              );
	    }

	    //return await this.cartModel.findOne({user: userId})
	}

	return await this.cartModel.findOne({user: userId})
   }

    async getMyItems(user: any) {
	const now = Date.now
	
	return await this.cartModel.aggregate([
	{ "$match": { "user": ObjectId(user.userId) } },
	{
	    $lookup: {
		from: 'users',
		localField: 'user',
		foreignField: '_id',
		as: 'user'
	    },
	},
	{
	   $unwind: "$user"
	},
	{
	   $lookup: {
		from: 'products',
		localField: 'product',
		foreignField: '_id',
		as: 'product'
	   }
	},
  	    { $project: {
		"user._id": 1,
		"user.name": 1,
		"user.email": 1,
		"user.phone_number": 1,
      		"items": { 
		  $filter: {
          	    input: '$items',
          	    as: 'items',
          	    cond: { $eq: ['$$items.isActive', true]},
		  }
		}
  	    }},
	    /**
	    { $addFields: {
	        items: {
                   $map: {
                        input: "$items",
                    	as: "items",
                    	"in": {
                           "_id": "$$items._id",
			   "qty" : 1,
			   "product": "$$items.product",
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
	    		   }}
                    	}
                   }
            	}
            },
	    */
	   ])
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
