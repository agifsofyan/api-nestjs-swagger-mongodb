import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ICart } from './interfaces/cart.interface';
import { IProduct } from '../product/interfaces/product.interface';
import { IUser } from '../user/interfaces/user.interface';
import { IdProductDTO } from './dto/cart.dto';

@Injectable()
export class CartService {
    constructor(
        @InjectModel('Cart') private readonly cartModel: Model<ICart>,
        @InjectModel('Product') private readonly productModel: Model<IProduct>,
        @InjectModel('User') private readonly userModel: Model<IUser>
    ) {}

    async getMyItems(){}

    async getByUserId(){}

    async add(user: any, idProduct: IdProductDTO): Promise<ICart> {
        const checkProduct = await this.productModel.findById(idProduct)
		if (!checkProduct) {
			throw new NotFoundException(`Could nod find product with id ${idProduct}`)
        }
            
        let id_user = null
        
        if(user != null){
            id_user = user.userId

            const checkProduct = await this.userModel.findById(id_user)
		    if (!checkProduct) {
			    throw new NotFoundException(`Could nod find user with id ${id_user}`)
            }
        }

        const data = {
            user: id_user,
            items: [{
                product: idProduct,
            }]
        }

        const result = new this.cartModel(data)

        return null
    }

    async purgeItem(){}
}
