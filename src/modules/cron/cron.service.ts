import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { MailService } from '../mail/mail.service';
import { OrderNotifyService } from '../order/services/notify.service';
import { OrderService } from '../order/services/order.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IOrder } from '../order/interfaces/order.interface';

const second = 1000 // 1 second = 1000 ms (milisecond)
const minute = second * 60
const hour = minute * 60

@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name);
    constructor(
        @Inject(forwardRef(() => OrderNotifyService))
        private readonly orderNotifyService: OrderNotifyService,
        private readonly mailService: MailService
    ) {}
    
    // @Cron(' 41 16 * * * ', {
    //     name: 'order_notification',
    //     timeZone: 'Asia/Jakarta',
    // })
    // handleCron() {
    //     this.logger.debug('Called when the current hours is 1');
    // }

    // @Cron(' * * * * * ', {
    //     name: 'order_notification',
    //     timeZone: 'Asia/Jakarta',
    // })
    // async handleCron() {
    //     var notifOrder
    //     try {
    //         notifOrder = await this.orderNotifyService.notifOrderWithCron()
    //         console.log('notifOrder', notifOrder)

    //         await this.orderModel.findOneAndUpdate(
    //             {_id: order[i]._id},
    //             {$push: { "email_job.pre_payment": (new Date()).toISOString() }},
    //             {upsert: true, new: true}
    //         )
            
    //         this.logger.debug(`${notifOrder}`);

    //         // if(typeof notifOrder !== "string"){
    //         //     this.addCronJob(notifOrder.time, notifOrder.data)
    //         // }
    //     } catch (error) {
    //         notifOrder = error
    //     }
    //     this.logger.debug(`${notifOrder}`);
    //     // this.logger.debug('Called when the current hours is 1');
    // }
    
    @Interval(minute * 10)
    async handleIntervals() {
        // const result = await this.orderNotifyService.updateStatusWithCron()
        // this.logger.debug(`${result}`);
    }

    // async addCronJob(time: number, orderId) {
    //     // console.log('time', time)
    //     const job = new CronJob(` * ${time} * * * `, async () => {
    //         // console.log('step 1')
    //         await this.orderNotifyService.notifOrderWithCron(orderId)
    //         this.logger.debug((new Date()).toISOString());
    //     })

    //     job.start()
    // }
}