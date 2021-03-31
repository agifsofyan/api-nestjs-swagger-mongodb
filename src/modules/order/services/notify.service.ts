import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IOrder } from '../interfaces/order.interface';
import { PaymentService } from '../../payment/payment.service';
import { currencyFormat } from 'src/utils/helper';
import { MailService } from 'src/modules/mail/mail.service';

@Injectable()
export class OrderNotifyService {
    constructor(
        @InjectModel('Order') private orderModel: Model<IOrder>,
        private readonly paymentService: PaymentService,
        private mailService: MailService
    ) {}

    private async statusChange(array){
        var checkStatus = new Array()
        for (let i in array){

            if (
                array[i].payment && 
                array[i].payment.method && 
                array[i].method.vendor !== 'Laruno'
            ){
                if (
                    array[i].payment.status === 'PENDING' || 
                    array[i].payment.status === 'FAILED' || 
                    array[i].payment.status === 'deny' || 
                    array[i].payment.status === 'ACTIVE' || 
                    array[i].payment.status === 'UNPAID'
                ){
                    checkStatus[i] = await this.paymentService.callback(array[i].payment)

                    await this.orderModel.findByIdAndUpdate(array[i]._id,
                        {"payment.status": checkStatus[i], "status": checkStatus[i]},
                        {new: true, upsert: true}
                    )
                }
            }
        }

        return checkStatus
    }

    async notifOrderWithCron(orderId) {
        var order = await this.orderModel.findOne({_id: orderId})

        var orderTb = order.items.map(item => {
            return `<tr>
            <td class="es-m-txt-l" bgcolor="#ffffff" align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:30px;padding-right:30px;"> <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:24px;font-family:lato, helvetica, arial, sans-serif;line-height:27px;color:#666666;">${item.product_info.name}</p> </td><td class="es-m-txt-l" bgcolor="#ffffff" align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:30px;padding-right:30px;"> <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:24px;font-family:lato, helvetica, arial, sans-serif;line-height:27px;color:#666666;">${currencyFormat(item.sub_price)} x ${item.quantity}</p> </td>
            </tr>`
        })
        const data = {
            name: order.user_info.name,
            from: "Order " + process.env.MAIL_FROM,
            to: order.user_info.email,
            subject: 'Your order is ready',
            type: 'order',
            orderTb: orderTb,
            totalPrice: currencyFormat(order.total_price)
        }

        const result = await this.mailService.templateGenerate(data)
        
        if(order.email_job.pre_payment.length < 4){
            order.email_job.pre_payment.push((new Date()).toISOString())
            order.save()
        }

        return result
    }

    // Get Users Order | To User
    async updateStatusWithCron() {
        try {
            const query = await this.orderModel.find({status: { $not: { $eq: 'PAID' } }})
            await this.statusChange(query)
            return 'success'
        } catch (error) {
           return 'failed'
        }
    }

    async danaPaid(input: any) {
        var order = await this.orderModel.findOne({ _id: input.exd })

        if(!order) console.log(`order danaPaid() not found`);

        if(order && order.status == 'PAID'){
            throw new BadGatewayException('this order has been paid')
        }

        order.status = "PAID"
        order.payment.status = "PAID"
        
        await order.save()

        return 'ok'
    }

    async confirm(input: any) {
        const { id, exd, user_id } = input
        var query = await this.orderModel.findOne(
            {_id: id, invoice: exd, user_info: user_id}
        )

        if(!query) throw new NotFoundException('order not found')

        query.payment.status = 'SUCCESS'
        query.status = 'PAID'
        
        await query.save()

        return 'ok'
    }
}