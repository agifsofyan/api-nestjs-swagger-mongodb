import { Injectable, NotFoundException, BadRequestException, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { IOrder } from './interfaces/order.interface';
import { OrderDto, SearchDTO } from './dto/order.dto';
import { IUser } from '../user/interfaces/user.interface';

import { ICart, IItemCart } from '../newCart/interfaces/cart.interface';
import { IProduct } from '../product/interfaces/product.interface';
import { IPaymentMethod as IPM } from '../payment/method/interfaces/payment.interface';
import { IPaymentAccount as IPA } from '../payment/account/interfaces/account.interface';
import { PaymentAccountService } from '../payment/account/account.service';
import { PaymentService } from '../payment/payment.service';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class OrderService {
    constructor(
        @InjectModel('Order') private orderModel: Model<IOrder>,
        @InjectModel('Cart') private readonly cartModel: Model<ICart>,
        @InjectModel('Product') private readonly productModel: Model<IProduct>,
        @InjectModel('PaymentAccount') private readonly paModel: Model<IPA>,
        @InjectModel('PaymentMethod') private readonly pmModel: Model<IPM>,
        private paService: PaymentAccountService,
        private paymentService: PaymentService
    ) {}
    
    async store(user: any, input: any){
        let userId = null
        if (user != null) {
            userId = user.userId
        }
        
        let items = input.items
        input.total_qty = 0
        var sub_qty = new Array()
        var sub_price = new Array()
        var bump_price = new Array()
        var productArray = new Array()
        var arrayPrice = new Array()
        var checkCart = new Array()
        // for(let i in items){
            
        //     checkCart[i] = await this.cartModel.findOne(
        //         {$and: [
        //             { user_id: userId },
        //             { 'items.product_id': items[i].product_id}
        //         ]}
        //     )

        //     if(!checkCart[i]){
        //         throw new NotFoundException(`product_id [${i}] = [${items[i].product_id}] not found in your cart`)
        //     }

        //     input.total_qty += items[i].quantity

        //     sub_qty[i] = items[i].quantity

        //     try {
        //         productArray[i] = await this.productModel.findOne({ _id: items[i].product_id })
        //     } catch (error) {
        //         throw new BadRequestException(`product_id [${i}] = [${items[i].product_id}], format is wrong`)
        //     }
            
        //     if(!productArray[i]){
        //         throw new NotFoundException(`Your product_id [${i}] = [${items[i].product_id}] not found in product`)
        //     }

        //     sub_price[i] = (productArray[i].sale_price > 0) ? productArray[i].sale_price : productArray[i].price
        //     items[i].sub_price = sub_price[i]

        //     bump_price[i] = (!items[i].is_bump) ? 0 : productArray[i].bump[0].bump_price
        //     items[i].bump_price = bump_price[i]

        //     await this.cartModel.findOneAndUpdate(
        //         { user_id: userId },
        //         {
        //             $pull: { items: { product_id: items[i].product_id } }
        //         }
        //     );

        //     if(productArray[i] && productArray[i].type == 'ecommerce'){
        //         productArray[i].ecommerce.stock -= items[i].quantity
        //         productArray[i].save()
        //     }

        //     arrayPrice[i] = ( sub_qty[i] * sub_price[i] ) + bump_price[i]
        // }
        
        input.total_price = 30 //arrayPrice.reduce((a,b) => a+b, 0)

        console.log('input.total_price',  input.total_price)

        if(!input.payment || !input.payment.method ){
            throw new BadRequestException('payment method is required')
        }

        var checkPM
        try {
            checkPM = await this.pmModel.findById(input.payment.method) 
        } catch (error) {
            throw new BadRequestException(`payment method with id ${input.payment.method} not valid`)
        }

        if(!checkPM){
            throw new NotFoundException(`payment method with id ${input.payment.method} not found`)
        }

        const checkPA = await this.paModel.findOne({user_id: userId, payment_type: input.payment.method})

        console.log('checkPA',  checkPA)

        if(!checkPA){
            throw new NotFoundException(`You don't have a ${checkPM.info}, please create ${checkPM.info} first`)
        }

        input.payment.account = checkPA._id
        input.payment.external_id = checkPA.external_id
        
        try {
            await this.paymentService.simulate_payment(checkPA.external_id, input.total_price)
        } catch (error) {
            throw new BadRequestException('Payment To xendit not working')
        }
        
        const order = await new this.orderModel({
            user_id: userId,
            items: items,
            ...input
        })

        await order.save()

        return await order
    }
}
