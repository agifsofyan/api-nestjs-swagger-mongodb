import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IOrder } from '../interfaces/order.interface';
import { PaymentService } from '../../payment/payment.service';
import { currencyFormat, fibonacci, nextHours } from 'src/utils/helper';
import { MailService } from 'src/modules/mail/mail.service';
import { CronService } from 'src/modules/cron/cron.service';

@Injectable()
export class OrderNotifyService {
    constructor(
        @InjectModel('Order') private orderModel: Model<IOrder>,
        private readonly paymentService: PaymentService,
        private mailService: MailService,
        private cronService: CronService
    ) {}

    private async statusChange(array){
        var checkStatus = new Array()
        for (let i in array){
            if (array[i].payment && array[i].payment.method){
                var status = 'PENDING'
                if (array[i].payment.status === 'PENDING' || array[i].payment.status === 'FAILED' || array[i].payment.status === 'deny' || array[i].payment.status === 'ACTIVE'){
                    checkStatus[i] = await this.paymentService.callback(array[i].payment)

                    if (checkStatus[i] === 'COMPLETED' || checkStatus[i] === 'PAID' || checkStatus[i] === 'SUCCESS_COMPLETED' || checkStatus[i] === 'SETTLEMENT'){

                        status = "PAID"
                    }else if(checkStatus[i] === 'EXPIRED' || checkStatus[i] === 'expire'){
                        status = 'EXPIRED'
                    }else{
                        status = checkStatus[i]
                    }

                    await this.orderModel.findByIdAndUpdate(array[i]._id,
                        {"payment.status": checkStatus[i], "status": status},
                        {new: true, upsert: true}
                    )
                }
            }
        }

        return checkStatus
    }

    async notifOrderWithCron() {
        var order = await this.orderModel.find({"email_job.after_payment": null, status: { $not: { $eq: 'EXPIRED' } }})

        for(let i in order){
            var orderTb = order[i].items.map(item => {
                return `<tr>
                <td class="es-m-txt-l" bgcolor="#ffffff" align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:30px;padding-right:30px;"> <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:24px;font-family:lato, helvetica, arial, sans-serif;line-height:27px;color:#666666;">${item.product_info.name}</p> </td><td class="es-m-txt-l" bgcolor="#ffffff" align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:30px;padding-right:30px;"> <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:24px;font-family:lato, helvetica, arial, sans-serif;line-height:27px;color:#666666;">${currencyFormat(item.sub_price)} x ${item.quantity}</p> </td>
                </tr>`
            })

            const data = {
                name: order[i].user_info.name,
                from: "Order " + process.env.MAIL_FROM,
                to: order[i].user_info.email,
                subject: 'Your order is ready',
                type: 'order',
                orderTb: orderTb,
                totalPrice: currencyFormat(order[i].total_price)
            }

            if (!order[i].email_job.pre_payment || order[i].email_job.pre_payment.length < 5){
                // await this.mailService.createVerify(data)

                const fibo = fibonacci(2,4,3)

                var y = order[i].email_job.pre_payment ? order[i].email_job.pre_payment.length : fibo.length

                var x = 0;
                while (x < y) {
                    const time = nextHours(order[i].create_date, fibo[i])
                    await this.cronService.addCronJob(time, data)
                    x++;
                }
                
                // const pushNotif = await this.mailService.createVerify(data)
                order[i].email_job.pre_payment.push(String(new Date().getTime()))
                order[i].save()

                return 'ok'
            }
        }

        return 'uptodate'
    }

    // Get Users Order | To User
    async updateStatusWithCron() {
        const query = await this.orderModel.find({status: { $not: { $eq: 'PAID' } }})
        try {
            await this.statusChange(query)
            return 'success'
        } catch (error) {
           return 'failed'
        }
    }
}