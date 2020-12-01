import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { IOrder } from '../interfaces/order.interface';

import { ICart } from '../../cart/interfaces/cart.interface';
import { IProduct } from '../../product/interfaces/product.interface';
import { PaymentService } from '../../payment/payment.service';
import { ShipmentService } from '../../shipment/shipment.service';

import { CouponService } from '../../coupon/coupon.service';

import { toInvoice } from 'src/utils/order';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class OrderService {
    constructor(
        @InjectModel('Order') private orderModel: Model<IOrder>,
        @InjectModel('Cart') private readonly cartModel: Model<ICart>,
        @InjectModel('Product') private readonly productModel: Model<IProduct>,
        private paymentService: PaymentService,
        private shipmentService: ShipmentService,
        private couponService: CouponService,
    ) {}
    
    async store(user: any, input: any){
        let userId = null
        if (user != null) {
            userId = user._id
        }
        input.user_info = userId
        
        var items = input.items
        input.total_qty = 0
	    var weight = 0
        var sub_qty = new Array()
        var sub_price = new Array()
        var bump_price = new Array()
        var productArray = new Array()
        var arrayPrice = new Array()
        var linkItems = new Array()
        var shipmentItem = new Array()
        var productType = new Array()

        var cartArray = new Array()
        
        for(let i in items){
            cartArray[i] = ObjectId(items[i].product_id)

            input.total_qty += (!items[i].quantity) ? 1 : items[i].quantity

            sub_qty[i] = (!items[i].quantity) ? 1 : items[i].quantity 
        }

        productArray = await this.cartModel.find(
            {$and: [
                { user_info: userId },
                { 'items.product_info': { $in: cartArray }}
            ]}
        )
            
        if(cartArray.length !== productArray.length){
            throw new NotFoundException('your product selected not found in the cart')
        }
            
        try {
            productArray = await this.productModel.find({ _id: { $in: cartArray } })
        } catch (error) {
            throw new BadRequestException(`product id bad format`)
        }
        
        if(productArray.length <= 0){
            throw new NotFoundException(`product id in: [${cartArray}] not found in product list`)
        }

        for(let i in items){
            sub_price[i] = productArray[i].sale_price <= 0 ? productArray[i].price : productArray[i].sale_price
            items[i].sub_price = sub_price[i]

            bump_price[i] = (!items[i].is_bump) ? 0 : ( productArray[i].bump.length > 0 ? (productArray[i].bump[0].bump_price ? productArray[i].bump[0].bump_price : 0) : 0)
            
	        items[i].bump_price = bump_price[i]

            arrayPrice[i] = ( sub_qty[i] * sub_price[i] ) + bump_price[i]
            /**
             * LinkAja - `Items`
             */
            linkItems[i] = {
                id: productArray[i]._id,
                name: productArray[i].name,
                price: arrayPrice[i],
                quantity: items[i].quantity
            }

            productType[i] = productArray[i].type

            if(productArray[i].type === 'ecommerce'){
                if(!input.shipment || !input.shipment.address_id){
                    throw new BadRequestException('shipment.address_id is required, because your product type is ecommerce')
                }

                shipmentItem[i] = {
                    item_description: productArray[i].name,
                    quantity: items[i].quantity,
                    is_dangerous_good: false
                }
                
                weight += productArray[i].ecommerce.weight
            }

            items[i].product_info = items[i].product_id
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
        }

        if(addressHandle.length < 1 && input.shipment && input.shipment.address_id){
            input.shipment.address_id = null
        }

        input.invoice = track.invoice

        try {
            const order = await new this.orderModel({
                items: items,
                ...input
            })

            for(let i in items){
                await this.cartModel.findOneAndUpdate(
                    { user_info: userId },
                    {
                        $pull: { items: { product_info: items[i].product_info } }
                    }
                );

                if(productArray[i] && productArray[i].type == 'ecommerce'){

                    if(productArray[i].ecommerce.stock < 1){
                        throw new BadRequestException('ecommerce stock is empty')
                    }

                    productArray[i].ecommerce.stock -= items[i].quantity
                    productArray[i].save()
                }
            }
            
            await order.save()

            return order
        } catch (error) {
            throw new InternalServerErrorException('An error occurred while removing an item from the cart or reducing stock on the product or when save order')
        }
    }
}
