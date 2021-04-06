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
import { PaymentService } from 'src/modules/payment/payment.service';
import { expiring } from 'src/utils/order';
import { 
    currencyFormat, 
    randomIn,
	onArray, 
	filterByReference,
    dinamicSort,
    sum
} from 'src/utils/helper';
import { CronService } from 'src/modules/cron/cron.service';
import { IUserProducts } from 'src/modules/userproducts/interfaces/userproducts.interface';
import { IContent } from 'src/modules/content/interfaces/content.interface';
import { UnixToStr } from 'src/utils/StringManipulation';
import { PaymentMethodService } from 'src/modules/payment/method/method.service';
import { X_TOKEN, X_CALLBACK_TOKEN } from 'src/config/configuration';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class OrderService {
    constructor(
        @InjectModel('Order') private orderModel: Model<IOrder>,
        @InjectModel('Cart') private readonly cartModel: Model<ICart>,
        @InjectModel('Product') private readonly productModel: Model<IProduct>,
        @InjectModel('User') private readonly userModel: Model<IUser>,
        @InjectModel('Content') private readonly contentModel: Model<IContent>,
        @InjectModel('UserProduct') private readonly userProductModel: Model<IUserProducts>,
        private shipmentService: ShipmentService,
        private couponService: CouponService,
        private mailService: MailService,
        private paymentService: PaymentService,
        private methodService: PaymentMethodService,
        private readonly cronService: CronService
    ) {}
    
    async store(user: any, input: any){
        const userId = user._id

        /**
         * UTM Checker
         */
        const checkUTM = input.items.find(obj => obj.utm )
        
        if(!checkUTM === undefined){
            throw new BadRequestException(`utm is required`)
        }

	    var itemsInput = input.items
        
        /**
         * Sort Input by Product Id (asc)
         */
	    itemsInput = itemsInput.sort(dinamicSort('product_id'))

        input.user_info = userId
        var ttlQty = 0
        var ttlPrice = 0
        var couponValue = 0
	    var ecommerceWeight = 0
        var ttlBump = 0
        var shipmentItem = new Array()
        var productType = new Array()

        /**
         * Check Available items (Product) in the cart
         */
        await this.cartModel.findOne({ user_info: userId }).then(cart => {
            cart = cart.toObject()

            const productItemInInput = itemsInput.map(item => item.product_id)
            const productItemInCart = cart.items.map(cart => cart.product_info.toString())
            const filtItem = onArray(productItemInInput, productItemInCart, false)

            if(filtItem.length > 0){
                throw new BadRequestException(`product_id ${filtItem} not found in the cart`)
            }

            const cartItems = cart.items.map(item => {
                item.product_info = item.product_info.toString()
                return item
            })

            /**
             * Filter available Input and Cart | handling data duplicate
             */
            cart.items = filterByReference(cartItems, itemsInput, 'product_id', 'product_info', true)

            /**
             * Filter Cart Items by product_info (product_id) asc
             */
            cart.items = cartItems.sort(dinamicSort('product_info'))
            return cart
        })
	
        for(let i in itemsInput){
            const product  = await this.productModel.findById(itemsInput[i].product_id)
            const qtyInput = itemsInput[i].quantity ? itemsInput[i].quantity : 1
            const isBump   = itemsInput[i].is_bump
            productType.push(product.type)

            if(!product){
                throw new NotFoundException(`product with id ${itemsInput[i].product_id} in products`)
            }

            const subPrice = product.sale_price <= 0 ? product.price : product.sale_price
            
            // input bump_price value if bump set to true
	        const bumpPrice = !isBump ? 0 : (
                product.bump.length > 0 ? (
                    product.bump[0].bump_price ? product.bump[0].bump_price : 0
                ) : 0
            )

            /**
             * Set Total of Bump
             */
            ttlBump += bumpPrice

            // Help calculate the total price
            var priceWithoutCoupon = (qtyInput * subPrice) + bumpPrice

            /**
             * Ecommerce Handling
             */
            if(product.type === 'ecommerce' && product.ecommerce.shipping_charges === true){
                if(!input.shipment || !input.shipment.address_id){
                    throw new BadRequestException('shipment.address_id is required, because your product type is ecommerce')
                }

                /**
                 * Handling Shipment Price to Raja Ongkir
                 */
                if(!input.shipment.price){
                    throw new BadRequestException('shipment.price is required')
                }

                // if(input.shipment.price === '' || input.shipment.price === undefined || input.shipment.price === null){
                //     delete input.shipment.price
                // }

                shipmentItem.push({
                    item_description: product.name,
                    quantity: qtyInput,
                    is_dangerous_good: false
                })
                
                ecommerceWeight += product.ecommerce.weight
            }

            if(product.type === 'bonus'){
                input.status = 'PAID'
            }

            itemsInput[i].bump_price = bumpPrice
            itemsInput[i].sub_price = subPrice
            ttlPrice += priceWithoutCoupon
            ttlQty += qtyInput
        }
        /**
         * Coupon Proccess
         */
        if(input.coupon && input.coupon.code){
            if(input.coupon.code === '' || input.coupon.code === undefined || input.coupon.code === null){
                delete input.coupon
            }
            const couponExecute = await this.couponService.calculate(input.coupon.code, ttlPrice)
            couponValue = couponExecute.value
            input.coupon = couponExecute.coupon._id
        }

        /**
         * TtlPrice - Coupon value
         */
        if(couponValue > 0){
            ttlPrice -= couponValue
        }

        /**
         * Total Price + shipping costs accumulation from Raja Ongkir 
         */


        /**
         * Shipment Proccess to order to NINJA
         */

        const track = toInvoice(new Date()) // create invoice

        if(productType.includes("ecommerce")){
            const shipmentDto = {
                requested_tracking_number: track.tracking,
                merchant_order_number: track.invoice,
                address_id: input.shipment.address_id,
                items: shipmentItem,
                weight: ecommerceWeight
            }
            const shipment = await this.shipmentService.add(user, shipmentDto)
            input.shipment.shipment_info = shipment._id

            /**
             * Total Price + shipping costs accumulation from Raja Ongkir 
             */

            ttlPrice += input.shipment.price
            input.shipment.price = input.shipment.price
        }
        
        /**
         * Create Invoice Number
         */
        input.invoice = track.invoice

         /**
         * Set total price as sub_total_price
         * Save from variable
         */
        input.sub_total_price   = ttlPrice
        input.total_qty         = ttlQty
        input.total_bump        = ttlBump
        input.dicount_value     = couponValue

        if(!input.total_price) input.total_price = 0;

        /**
         * Validation Check Client Side
         */
        if(input.total_price !== ttlPrice){
            throw new BadRequestException(`total price is wrong. True is: ${ttlPrice}`)
        }

        /**
         * Create Order
         */
        const order = new this.orderModel({
            items: itemsInput,
            ...input
        })

        if(order.status === 'PAID'){
            const orderItems = order.items
            
            for(let i in orderItems){
                const product_id = orderItems[i].product_info
                const utm = orderItems[i].utm
                const qtyOrder = orderItems[i].quantity

                const productToUser = await this.productModel.findById(product_id)

                if(!productToUser){
                    // throw new BadRequestException('product not found')
                    console.log('productToUser', productToUser)
                }
                
                /**
                 * Create LMS Data
                 */
                const content = await this.contentModel.findOne({"product._id": product_id})

                if(!content){
                    // throw new BadRequestException('content not found')
                    console.log('content', content)
                }else{
                    const userProduct = new this.userProductModel({
                        user_id: userId,
                        product_id: product_id,
                        product_type: productToUser.type,
                        content_id: content._id,
                        content_type: content.isBlog ? 'blog' : 'fulfilment',
                        content_kind: content.post_type,
                        topic: productToUser.topic.map(topic => topic),
                        utm: utm,
                        order_invoice: order.invoice,
                        expired_date: productToUser.time_period === 0 ? null : expiring(productToUser.time_period * 30)
                    })
                    await userProduct.save()
                }

                // if(productToUser.type == 'ecommerce'){
                //     /**
                //      * Pull stock from product
                //      */
                //     try {
                //         if(productToUser.ecommerce.stock < 1){
                //             throw new BadRequestException('ecommerce stock is empty')
                //         }
        
                //         productToUser.ecommerce.stock -= qtyOrder
                //         await this.productModel.findByIdAndUpdate(
                //             product_id,
                //             { "ecommerce.stock": productToUser.ecommerce.stock }
                //         );
                //     } catch (error) {
                //         throw new NotImplementedException('stock of product is empty')
                //     }
                // }
            }
        }

        try {
            for(let i in itemsInput){
                await this.cartModel.findOneAndUpdate(
                    { user_info: userId },
                    {
                        $pull: { items: { product_info: ObjectId(itemsInput[i].product_id) } }
                    }
                );
            }
        } catch (error) {
            throw new NotImplementedException('Failed to pull item from the basket')
        }

        // var sendMail
        // try {
        //     let fibo = [3,6,12,24]
        //     for(let i in fibo){
        //         await this.cronService.addCronJob(fibo[i], order._id)
        //     }
	   
        // } catch (error) {
        //     throw new NotImplementedException('Failed to send email notification')
        // }

        try {
            await order.save()

            const orderNow = await this.orderModel.findOne({_id: order._id}).then(res => res.items)
            // const sendMail = await this.orderNotif(userId, orderNow, order.total_price)
            const sendMail = 'mail off'

            return {
                order: order,
                mail: sendMail
            }
        } catch (error) {
            throw new NotImplementedException('Failed to create order (order/store)')
        }
    }

    async pay(user: any, order_id: any, input: any){
        const username = user.name
        const email = user.email
        const userId = user._id
        const userPhone = user.phone_number
        
        var order = await this.orderModel.findOne({_id: order_id, user_info: userId})

        if(!order){
            throw new NotFoundException(`order with id ${order_id} & user email ${email} not found`)
        }

        if(order.payment.method != undefined){
            throw new BadRequestException('you have already chosen a payment method')
        }

        if(!input.payment.method){
            throw new BadRequestException('payment.method is required')
        }

        const items = order.items
        var productIDS = new Array()
        for(let i in items){
            productIDS[i] = items[i].product_info
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

        //check payment method required
        const payment_method = await this.methodService.getById(input.payment.method)

        if(payment_method.info === 'Bank-Transfer'){
            if(typeof input.unique_number === 'string'){
                throw new BadRequestException(`unique number must be number`)
            }

            if(!input.unique_number){
                throw new BadRequestException(`unique number is required to bank transfer`)
            }

            if(input.unique_number === 0 || String(input.unique_number).length != 3){
                throw new BadRequestException(`avilable length the unique number is 3 digit`)
            }
        }else{
            input.unique_number = 0
        }

        const ttlPrice = !order.sub_total_price ? order.total_price : (order.sub_total_price + input.unique_number)

        if(!input.total_price) input.total_price = 0;

        if(input.total_price !== order.sub_total_price){
            throw new BadRequestException(`total price is wrong. Value is: ${order.sub_total_price}`)
        }

        const orderKeys = {
            // amount: input.total_price,
            amount: ttlPrice,
            method_id: input.payment.method,
            external_id: order.invoice,
            phone_number: !input.payment.phone_number ? userPhone : input.payment.phone_number,
            user_id: userId,
            order_id: order_id
        }
        
        const toPayment = await this.paymentService.prepareToPay(orderKeys, username, linkItems)
        // console.log('toPayment', toPayment)
        // if(toPayment.isTransfer === true){
            // input.total_price += randomIn(3) // 'randThree' is to bank transfer payment method
            // input.total_price
        // }
        
        input.total_price = ttlPrice
        input.payment = {...toPayment}
        input.status = 'UNPAID'
        input.expiry_date = expiring(2)

        // await this.orderNotif(user._id, order.items, order.total_price)
            
        // let fibo = [3,6,12,24]
        // for(let i in fibo){
        //     await this.cronService.addCronJob(fibo[i], order._id)
        // }

        try {
            await this.orderModel.findOneAndUpdate({_id: order_id}, { $set: input }, {upsert: true, new: true})
        } catch (error) {
            throw new NotImplementedException("can't update order (order/pay)")
        }

        return await this.orderModel.findById(order_id)
    }

    private async orderNotif(userId: any, items: any, price: number){
        var user: any
        console.log('items', items)
        try {
            user = await this.userModel.findOne({_id: userId}).then(user => {
                return { name: user.name, email: user.email }
            })
        } catch (error) {
            throw new NotFoundException('user not found')
        }

        var array = new Array()
        for(let i in items){
            console.log('items.product_info', items[i].product_info)
            array[i] = `<tr>
                <td class="es-m-txt-l" bgcolor="#ffffff" align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:30px;padding-right:30px;"> <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:24px;font-family:lato, helvetica, arial, sans-serif;line-height:27px;color:#666666;">${items[i].product_info.name}</p> </td><td class="es-m-txt-l" bgcolor="#ffffff" align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:30px;padding-right:30px;"> <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:24px;font-family:lato, helvetica, arial, sans-serif;line-height:27px;color:#666666;">${currencyFormat(items[i].sub_price)} x ${items[i].quantity ? items[i].quantity : 1}</p> </td>
            </tr>`
        }

        const data = {
            name: user.name,
            from: "Pesanan " + process.env.MAIL_FROM,
            to: user.email,
            subject: 'Pesanan kamu sudah siap nih',
            type: 'order',
            orderTb: array,
            totalPrice: currencyFormat(price)
        }
        
        return await this.mailService.templateGenerate(data)
    }

    async unique(user: any, order_id: string) {
        const userId = user._id
        const email = user.email

        const orderExist = await this.orderModel.findOne({user_info: userId, _id: order_id})
        // const orderExist = await this.orderModel.findOne({_id: order_id})

        if(!orderExist){
            throw new NotFoundException(`order with id ${order_id} & user email ${email} not found`)
        }

        if(orderExist.unique_number != 0){
            throw new BadRequestException('unique number already exists')
        }

        const unique = randomIn(3)
        // var ttlPrice = orderExist.sub_total_price + unique

        return unique

        // try {
        //     await this.orderModel.findOneAndUpdate(
        //         {_id: order_id}, 
        //         {unique_number: unique, total_price: ttlPrice},
        //         {new: true, upsert: true}
        //     )
        //     return unique
        // } catch (error) {
        //     throw new NotImplementedException(`cannot save the unique number`)
        // }
    }

    async vaCallback(input: any) {
        const {external_id, status} = input
        var order = await this.orderModel.findOne({"payment.external_id": external_id})
        if(order){
            if(order.status === 'UNPAID'){
                try {
                    order.status = 'PAID'
                    return await order.save()
                } catch (error) {
                    throw new NotImplementedException('cannot update status')
                }
            }else{
                throw new BadRequestException('order has PAID')
            }
        }else{
            throw new NotFoundException('order not found')
        }

    }
}
