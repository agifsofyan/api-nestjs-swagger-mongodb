import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

const second = 1000 
const hour = second * 3600

@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name);
    
    // @Cron(' 41 16 * * * ', {
    //     name: 'order_notification',
    //     timeZone: 'Asia/Jakarta',
    // })
    // handleCron() {
    //     this.logger.debug('Called when the current hours is 1');
    // }
    
    // @Interval(second)
    // handleIntervals() {
    //     this.logger.debug('Called every 10 seconds');
    // }

    addCronJob(time: any, func: any) {
        const job = new CronJob(` ${time.minute} ${time.hour} * * * `, () => {
            return func
        })

        job.start()
    }
}