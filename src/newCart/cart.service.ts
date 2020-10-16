import { Injectable, NotFoundException } from '@nestjs/common';
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

    async add(user: any, addCartDTO: addCartDTO): Promise<ICart> {
        let userId = null
        if(user != null){
            userId = user.userId
        }

        console.log('userId', userId)

        let checkCar = await this.cartModel.find({
            $and: [
                {user: userId},
                {items : { $elemMatch : { product : addCartDTO.id } }} 
            ]
        })

        console.log('checkCar', checkCar[0]._id)

        if(!checkCar){
            let cart = new this.cartModel({
                user: userId,
                items: [{product: addCartDTO.id}]
            })
            cart.save()
        }

        const result = await this.cartModel.findOneAndUpdate(
			{ _id: checkCar[0]._id },
            {
                $push: { 
                    items: {
                        product: addCartDTO.id,
                        variant: null,
                        qty: 1,
                        note: null,
                        shipment: '',
                        isActive: true
                    }
                }
            },
			{ new: true, upsert: true }
        );

        // console.log('result', result)
        
        return await this.cartModel.findOne({user: userId});

        
        // user: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'User'
        // },
        // items: [{
        //     product: {
        //         type: mongoose.Schema.Types.ObjectId,
        //         ref: 'Product'
        //     },
        //     variant: String,
        //     qty: Number,
        //     note: String,
        //     shipment: {
        //         type: mongoose.Schema.Types.ObjectId,
        //         ref: 'Shipment'
        //     },
        //     isActive: Boolean
        // }],
        // coupon: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Coupon'
        // },
        // total_qty: Number,
        // total_price: Number,
        // expiry_date: Date,
        // status: String,

        // console.log('id', addCartDTO)
        // const productId = addCartDTO.id
        // const checkProduct = await this.productModel.findById(productId)
		// if (!checkProduct) {
		// 	throw new NotFoundException(`Could nod find product with id ${productId}`)
        // }
        
        // let id_user = null

        // if(user == null){
        //     let result = new this.cartModel({
        //         cookie_id: cookieId,
        //         user: id_user,
        //         items: [{
        //             product: productId,
        //         }]
        //     })
        //     return await result.save()
        // }else{
        //     id_user = user.userId

        //     const checkProduct = await this.userModel.findById(id_user)
		//     if (!checkProduct) {
		// 	    throw new NotFoundException(`Could nod find user with id ${id_user}`)
        //     }

        //     await this.cartModel.findOneAndUpdate({user: id_user}, {$set: {

        //         user: id_user,
        //         items: [{
        //             product: productId,
        //             variant: null,
        //             qty: null,
        //             note: null
        //         }],
        //     }}, {new: true, upsert: true})
        //     return await this.cartModel.findOne({ user: id_user })
        // }
        return null
    }

    // async getMyItems(user: any): Promise<any[]> {
    //     const result = await this.cartModel.find({})
    // }

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