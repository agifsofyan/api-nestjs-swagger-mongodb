import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { MailService } from '../mail/mail.service';
import { OrderNotifyService } from '../order/services/notify.service';
import { OrderService } from '../order/services/order.service';

const second = 1000 // 1 second = 1000 ms (milisecond)
const minute = second * 60
const hour = minute * 60

@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name);
    constructor(
        @Inject(forwardRef(() => OrderNotifyService))
        private readonly orderNotifyService: OrderNotifyService,
        private readonly mailService: MailService,
    ) {}
    
    // @Cron(' 41 16 * * * ', {
    //     name: 'order_notification',
    //     timeZone: 'Asia/Jakarta',
    // })
    // handleCron() {
    //     this.logger.debug('Called when the current hours is 1');
    // }

    @Cron(' * * * * * ', {
        name: 'order_notification',
        timeZone: 'Asia/Jakarta',
    })
    async handleCron() {
        var notifOrder
        try {
            notifOrder = await this.orderNotifyService.notifOrderWithCron()
            console.log('notifOrder', notifOrder)
            this.logger.debug(`${notifOrder}`);

            // if(typeof notifOrder !== "string"){
            //     this.addCronJob(notifOrder.time, notifOrder.data)
            // }
        } catch (error) {
            notifOrder = error
        }
        this.logger.debug(`${notifOrder}`);
        // this.logger.debug('Called when the current hours is 1');
    }
    
    @Interval(minute * 10)
    async handleIntervals() {
        // const result = await this.orderNotifyService.updateStatusWithCron()
        // this.logger.debug(`${result}`);
    }

    async addCronJob(time: any, data: any) {
        const job = new CronJob(` ${time.minute} ${time.hour} * * * `, async () => {
            await this.mailService.createVerify(data)
        })

        job.start()
    }
}