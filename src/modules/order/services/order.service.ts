import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { IOrder } from '../interfaces/order.interface';

import { ICart } from '../../cart/interfaces/cart.interface';
import { IProduct } from '../../product/interfaces/product.interface';
import { ShipmentService } from '../../shipment/shipment.service';

import { CouponService } from '../../coupon/coupon.service';

import { toInvoice } from 'src/utils/order';
import { MailService } from 'src/modules/mail/mail.service';
import { IUser } from 'src/modules/user/interfaces/user.interface';
import { currencyFormat } from 'src/utils/helper';
import { PaymentService } from 'src/modules/payment/payment.service';

import { expiring } from 'src/utils/order';
import { randomIn } from 'src/utils/helper';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class OrderService {

    constructor(
        @InjectModel('Order') private orderModel: Model<IOrder>,
        @InjectModel('Cart') private readonly cartModel: Model<ICart>,
        @InjectModel('Product') private readonly productModel: Model<IProduct>,
        @InjectModel('User') private readonly userModel: Model<IUser>,
        private shipmentService: ShipmentService,
        private couponService: CouponService,
        private mailService: MailService,
        private paymentService: PaymentService
    ) {}
    
    async store(user: any, input: any){
        const userId = user._id

        const checkUTM = input.items.find(obj => obj.utm )
        
        if(!checkUTM === undefined){
            throw new BadRequestException(`utm is required`)
        }

        input.user_info = userId
        
        var items = input.items
        input.total_qty = 0
	    var weight = 0
        var sub_qty = new Array()
        var cartAvailable = new Array()
        var arrayPrice = new Array()
        var shipmentItem = new Array()
        var productType = new Array()
        var cartInput = new Array()
        
        for(let i in items){
            cartInput[i] = items[i].product_id
        }

        
        try {
            cartAvailable = await this.cartModel.findOne({ user_info: userId, 'items.product_info': { $in: cartInput } }).then(cart => cart.items)
        } catch (error) {
            throw new NotFoundException('cart items is empty')
        }
        
        if(cartInput.length !== cartAvailable.length){
            throw new NotFoundException('your product selected not found in the cart')
        }
            
        try {
            cartAvailable = await this.productModel.find({ _id: { $in: cartInput } })
        } catch (error) {
            throw new BadRequestException(`product id bad format`)
        }
        
        if(cartAvailable.length <= 0){
            throw new NotFoundException(`product id in: [${cartInput}] not found in product list`)
        }

        for(let i in items){
            input.total_qty += (!items[i].quantity) ? 1 : items[i].quantity

            // handle if qty not inputed
            sub_qty[i] = (!items[i].quantity) ? 1 : items[i].quantity

            // create sub_price in items: value price or sale_price
            items[i].sub_price = cartAvailable[i].sale_price <= 0 ? cartAvailable[i].price : cartAvailable[i].sale_price
            
            // input bump_price value if bump set to true
	        items[i].bump_price = (!items[i].is_bump) ? 0 : ( cartAvailable[i].bump.length > 0 ? (cartAvailable[i].bump[0].bump_price ? cartAvailable[i].bump[0].bump_price : 0) : 0)

            // Help calculate the total price
            arrayPrice[i] = ( sub_qty[i] * items[i].sub_price ) + items[i].bump_price

            // Product Type: ecommerce, boe
            productType[i] = cartAvailable[i].type

            if(cartAvailable[i].type === 'ecommerce'){
                if(!input.shipment || !input.shipment.address_id){
                    throw new BadRequestException('shipment.address_id is required, because your product type is ecommerce')
                }

                if(!input.shipment.price){
                    throw new BadRequestException('shipment.price is required')
                }

                shipmentItem[i] = {
                    item_description: cartAvailable[i].name,
                    quantity: items[i].quantity,
                    is_dangerous_good: false
                }
                
                weight += cartAvailable[i].ecommerce.weight
            }

            for(let j in cartAvailable){
                if(items[i].product_id === (cartAvailable[j]._id).toString()){
                    items[i].name = cartAvailable[j].name
                }
            }
        }
	
        input.total_price = arrayPrice.reduce((a,b) => a+b, 0)

        if(input.coupon && input.coupon.code){
            const couponExecute = await this.couponService.calculate(input.coupon.code, input.total_price)
		//console.log('couponExecute', couponExecute)
            const { coupon, value } = couponExecute

            input.coupon = {...coupon}
            input.coupon.id = coupon._id

            input.total_price -= value
        }
	
        const track = toInvoice(new Date())
	    input.invoice = track.invoice
        
        const addressHandle = productType.filter(p => p === 'ecommerce')
        if(addressHandle.length >= 1){
            const shipmentDto = {
                requested_tracking_number: track.tracking,
                merchant_order_number: track.invoice,
                address_id: input.shipment.address_id,
                items: shipmentItem,
                weight: weight
            }
            
            const shipment = await this.shipmentService.add(user, shipmentDto)
            input.shipment.shipment_info = shipment._id
            Number(input.shipment.price)
        }

        if(addressHandle.length < 1 && input.shipment && input.shipment.address_id){
            input.shipment.address_id = null
            input.shipment.price = 0
            input.total_price += input.shipment.price
        }

        try {
            const order = await new this.orderModel({
                items: items,
                ...input
            })

            for(let i in items){
                await this.cartModel.findOneAndUpdate(
                    { user_info: userId },
                    {
                        $pull: { items: { product_info: items[i].product_id } }
                    }
                );

                if(cartAvailable[i] && cartAvailable[i].type == 'ecommerce'){

                    if(cartAvailable[i].ecommerce.stock < 1){
                        throw new BadRequestException('ecommerce stock is empty')
                    }

                    cartAvailable[i].ecommerce.stock -= items[i].quantity
                    cartAvailable[i].save()
                }
            }
            
            await order.save()

            const sendMail = await this.orderNotif(userId, items, order.total_price)

            // const fibo = fibonacci(2,4,3)

            // for(let i in fibo){
            //     const time = nextHours(order.create_date, fibo[i])
            //     const pushNotif = await this.orderNotif(userId, items, order.total_price)
            //     this.cronService.addCronJob(time, pushNotif)
            // }
            
            return {
                order: order,
                mail: sendMail
            }
        } catch (error) {
            throw new InternalServerErrorException('An error occurred while removing an item from the cart or reducing stock on the product or when save order')
        }
    }

    async pay(user: any, order_id: any, input: any){
        const username = user.name
        var order
        try {
            order = await this.orderModel.findById(order_id)

            if(!order){
                throw new NotFoundException('order not found')
            }
        } catch (error) {
            throw new NotImplementedException('order id not valid format')
        }

        if(!input.payment.method){
            throw new BadRequestException('payment.method is required')
        }

        const items = order.items
        var productIDS = new Array()
        for(let i in items){
            productIDS[i] = items[i].product_id
        }

        const products = await this.productModel.find({ _id: { $in: productIDS } })
        if(productIDS.length !== products.length){
            throw new NotFoundException('product not found in order')
        }

        /**
         * LinkAja - `Items`
         */
        var linkItems = new Array()
        for(let i in products){
            linkItems[i] = {
                id: products[i].id,
                name: products[i].name,
                price: products[i].price,
                quantity: (!items[i].quantity) ? 1 : items[i].quantity,
            }
        }

        const orderKeys = {
            amount: order.total_price,
            method_id: input.payment.method,
            external_id: order.invoice,
            expired: input.expiry_date,
            phone_number: input.payment.phone_number
        }
        
        const toPayment = await this.paymentService.prepareToPay(orderKeys, username, linkItems)
        if(toPayment.isTransfer === true){
            input.total_price += randomIn(3) // 'randThree' is to bank transfer payment method
        }

        input.status = 'UNPAID'
        input.expiry_date = expiring(2)

        try {
            await this.orderModel.findOneAndUpdate({_id: order_id}, { $set: input }, {upsert: true, new: true})
            return await this.orderModel.findById(order_id)
        } catch (error) {
            throw new NotImplementedException("can't update order")
        }
    }

    private async orderNotif(userId: any, items: any, price: number){
        var user: any
        try {
            user = await this.userModel.findOne({_id: userId}).then(user => {
                return { name: user.name, email: user.email }
            })
        } catch (error) {
            throw new NotFoundException('user not found')
        }

        var array = new Array()
        for(let i in items){
            array[i] = `<tr>
                <td class="es-m-txt-l" bgcolor="#ffffff" align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:30px;padding-right:30px;"> <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:24px;font-family:lato, helvetica, arial, sans-serif;line-height:27px;color:#666666;">${items[i].name}</p> </td><td class="es-m-txt-l" bgcolor="#ffffff" align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:30px;padding-right:30px;"> <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:24px;font-family:lato, helvetica, arial, sans-serif;line-height:27px;color:#666666;">${currencyFormat(items[i].sub_price)} x ${items[i].quantity ? items[i].quantity : 1}</p> </td>
            </tr>`
        }

        const data = {
            name: user.name,
            from: "Order " + process.env.MAIL_FROM,
            to: user.email,
            subject: 'Your order is ready',
            type: 'order',
            orderTb: array,
            totalPrice: currencyFormat(price)
        }
        
        return await this.mailService.createVerify(data)
    }
}
