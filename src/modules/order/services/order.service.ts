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
    dinamicSort
} from 'src/utils/helper';
import { CronService } from 'src/modules/cron/cron.service';
import { IUserProducts } from 'src/modules/userproducts/interfaces/userproducts.interface';
import { IContent } from 'src/modules/content/interfaces/content.interface';
import { UnixToStr } from 'src/utils/StringManipulation';

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
        private readonly cronService: CronService
    ) {}
    
    async store(user: any, input: any){
        const userId = user._id

        const checkUTM = input.items.find(obj => obj.utm )
        
        if(!checkUTM === undefined){
            throw new BadRequestException(`utm is required`)
        }

	    var itemsInput = input.items

	    itemsInput = itemsInput.sort(dinamicSort('product_id'))

        input.user_info = userId
        input.total_qty = 0
        var ttlPrice: number
	    var weight = 0
        var sub_qty = new Array()
        var arrayPrice = new Array()
        var shipmentItem = new Array()

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

            cart.items = filterByReference(cartItems, itemsInput, 'product_id', 'product_info', true)

            cart.items = cartItems.sort(dinamicSort('product_info'))
            
            return cart
        })
	
        for(let i in itemsInput){
            const product = await this.productModel.findById(itemsInput[i].product_id)

            if(!product){
                throw new NotFoundException(`product with id ${itemsInput[i].product_id} in products`)
            }

	        sub_qty[i] = !itemsInput[i].quantity ? 1 : itemsInput[i].quantity
            input.total_qty += sub_qty[i]

            // create sub_price in items: value price or sale_price
            itemsInput[i].sub_price = product.sale_price <= 0 ? product.price : product.sale_price
            
            // input bump_price value if bump set to true
	        itemsInput[i].bump_price = !itemsInput[i].is_bump ? 0 : (product.bump.length > 0 ? (product.bump[0].bump_price ? product.bump[0].bump_price : 0) : 0)

            // Help calculate the total price
            arrayPrice[i] = (sub_qty[i] * itemsInput[i].sub_price) + itemsInput[i].bump_price

            ttlPrice = (sub_qty[i] * itemsInput[i].sub_price) + itemsInput[i].bump_price

            if(input.coupon && input.coupon.code){
                if(input.coupon.code === '' || input.coupon.code === undefined || input.coupon.code === null){
                    delete input.coupon
                }else{
                    const couponExecute = await this.couponService.calculate(input.coupon.code, ttlPrice)
                    const { coupon, value } = couponExecute
                    
                    input.coupon = {...coupon}
                    input.coupon.id = coupon._id
                    
                    ttlPrice -= value
                }
            }

            const track = toInvoice(new Date())
	        input.invoice = track.invoice

            if(product.type === 'ecommerce' && product.ecommerce.shipping_charges === true){
                if(!input.shipment || !input.shipment.address_id){
                    throw new BadRequestException('shipment.address_id is required, because your product type is ecommerce')
                }

                if(input.shipment.address_id === '' || input.shipment.address_id === undefined || input.shipment.address_id === null){
                    delete input.shipment.address_id
                }

                if(!input.shipment.price){
                    throw new BadRequestException('shipment.price is required')
                }

                if(input.shipment.price === '' || input.shipment.price === undefined || input.shipment.price === null){
                    delete input.shipment.price
                }

                shipmentItem[i] = {
                    item_description: product.name,
                    quantity: itemsInput[i].quantity ? itemsInput[i].quantity : 1,
                    is_dangerous_good: false
                }
                
                weight += product.ecommerce.weight

                const shipmentDto = {
                    requested_tracking_number: track.tracking,
                    merchant_order_number: track.invoice,
                    address_id: input.shipment.address_id,
                    items: shipmentItem,
                    weight: weight
                }
                
                const shipment = await this.shipmentService.add(user, shipmentDto)
                input.shipment.shipment_info = shipment._id

                ttlPrice = Number(ttlPrice) + Number(input.shipment.price)

                try {
                    if(product.ecommerce.stock < 1){
                        throw new BadRequestException('ecommerce stock is empty')
                    }
    
                    product.ecommerce.stock -= itemsInput[i].quantity ? itemsInput[i].quantity : 1
                    await this.productModel.findByIdAndUpdate(
                        product._id,
                        { "ecommerce.stock": product.ecommerce.stock }
                    );
                } catch (error) {
                    throw new NotImplementedException('Failed to change stock items in product table')
                }
            }

            if(product.type === 'bonus'){
                input.status = 'PAID'
            }

            if(product.type != 'ecommerce' && input.shipment){
                delete input.shipment
            }
        }

        console.log('ttlPrice', ttlPrice)

        if(input.total_price !== ttlPrice){
            throw new BadRequestException(`total price is wrong`)
        }else{
            input.sub_total_price = ttlPrice
        }

        const order = await new this.orderModel({
            items: itemsInput,
            ...input
        })

        if(order.status === 'PAID'){
            const orderItems = order.items
            
            for(let i in orderItems){
                const productToUser = await this.productModel.findById(orderItems[i].product_info)

                if(!productToUser){
                    // throw new BadRequestException('product not found')
                    console.log('productToUser', productToUser)
                }
                
                console.log('orderItems[i].product_info', orderItems[i].product_info)
                const content = await this.contentModel.findOne({"product._id": orderItems[i].product_info})

                if(!content){
                    // throw new BadRequestException('content not found')
                    console.log('content', content)
                }else{
                    const userItems = {
                        user_id: userId,
                        product_id: orderItems[i].product_info,
                        product_type: productToUser.type,
                        content_id: content._id,
                        content_type: content.isBlog ? 'blog' : 'fulfilment',
                        content_kind: content.post_type,
                        topic: productToUser.topic.map(topic => topic),
                        utm: orderItems[i].utm,
                        order_invoice: order.invoice,
                        expired_date: productToUser.time_period === 0 ? null : expiring(productToUser.time_period * 30)
                    }

                    const userProduct = new this.userProductModel(userItems)
                    await userProduct.save()
                }
            }
        }

        // try {
        //     for(let i in itemsInput){
        //         await this.cartModel.findOneAndUpdate(
        //             { user_info: userId },
        //             {
        //                 $pull: { items: { product_info: ObjectId(itemsInput[i].product_id) } }
        //             }
        //         );
        //     }
        // } catch (error) {
        //     throw new NotImplementedException('Failed to pull item from the basket')
        // }

        // var sendMail
        // try {
            // const sendMail = await this.orderNotif(userId, order.items, order.total_price)
            
            // let fibo = [3,6,12,24]
            // for(let i in fibo){
            //     await this.cronService.addCronJob(fibo[i], order._id)
            // }
	   
        // } catch (error) {
        //     throw new NotImplementedException('Failed to send email notification')
        // }

        try {
            await order.save()
            return {
                order: order,
                // mail: sendMail
            }
        } catch (error) {
            throw new NotImplementedException('Failed to create order (order/store)')
        }

    }

    async pay(user: any, order_id: any, input: any){
        const username = user.name
        const email = user.email
        const userId = user._id
        
        var order = await this.orderModel.findOne({_id: order_id, user_info: userId})

        if(!order){
            throw new NotFoundException(`order with id ${order_id} & user email ${email} not found`)
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
        
        if(input.total_price !== order.total_price){
            throw new BadRequestException('total price is wrong')
        }

        const orderKeys = {
            amount: order.total_price,
            method_id: input.payment.method,
            external_id: order.invoice,
            expired: input.expiry_date,
            phone_number: input.payment.phone_number
        }
        
        const toPayment = await this.paymentService.prepareToPay(orderKeys, username, linkItems)


        // if(toPayment.isTransfer === true){
            // input.total_price += randomIn(3) // 'randThree' is to bank transfer payment method
            // input.total_price
        // }
        
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
                <td class="es-m-txt-l" bgcolor="#ffffff" align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:30px;padding-right:30px;"> <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:24px;font-family:lato, helvetica, arial, sans-serif;line-height:27px;color:#666666;">${items[i].product_info.name}</p> </td><td class="es-m-txt-l" bgcolor="#ffffff" align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:30px;padding-right:30px;"> <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:24px;font-family:lato, helvetica, arial, sans-serif;line-height:27px;color:#666666;">${currencyFormat(items[i].sub_price)} x ${items[i].quantity ? items[i].quantity : 1}</p> </td>
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
        
        return await this.mailService.templateGenerate(data)
    }

    async unique(user: any, order_id: string) {
        const userId = user._id
        const email = user.email
        const orderExist = await this.orderModel.findOne({user_info: userId, _id: order_id})

        console.log('order', orderExist)

        if(!orderExist){
            throw new NotFoundException(`order with id ${order_id} & user email ${email} not found`)
        }

        const unique = randomIn(3)
        var ttlPrice = orderExist.total_price + unique

        try {
            await this.orderModel.findOneAndUpdate(
                {_id: order_id}, 
                {unique_number: unique, total_price: ttlPrice},
                {new: true, upsert: true}
            )
            return unique
        } catch (error) {
            throw new NotImplementedException(`cannot save the unique number`)
        }
    }
}
