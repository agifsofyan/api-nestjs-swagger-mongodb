import { 
    Injectable,
    HttpService,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { X_TOKEN, X_CALLBACK_TOKEN } from 'src/config/configuration';
import { IOrder } from '../order/interfaces/order.interface';
import { DanaService } from './dana/dana.service';
import { PaymentMethodService } from './method/method.service';
import { XenditService } from './xendit/xendit.service';

var headerConfig:any = {
    headers: {
        'Authorization': `Basic ${X_TOKEN}`,
        'Content-Type': 'application/json'
    },
}

@Injectable()
export class PaymentService {
    constructor(
        private methodService: PaymentMethodService,
        private http: HttpService,
        private danaService: DanaService,
        private xenditService: XenditService,
        @InjectModel('Order') private readonly orderModel: Model<IOrder>,
    ) {}

    async prepareToPay(input: any, userName: string, linkItems: any) {
        const { amount, method_id, external_id, phone_number } = input
        
        const payment_method = await this.methodService.getById(method_id)

        var response = {
            external_id: external_id,
            method: payment_method,
            status: 'UNPAID',
            message: null,
            invoice_url: null,
            payment_code: null,
            pay_uid: null,
            phone_number: null,
            isTransfer: true,
            callback_id: null
        }

        if(payment_method.vendor === 'Xendit'){

            const paying = await this.xenditService.createOrder(input, userName, linkItems, payment_method)

            response.status = (!paying.data.status) ? 'UNPAID' : paying.data.status
            response.message = (!paying.data.message) ? null : paying.data.message
            response.invoice_url = (!paying.data.checkout_url) ? null : paying.data.checkout_url
            response.payment_code = (payment_method.info == 'Retail-Outlet') ? paying.data.payment_code : null
            response.pay_uid = (payment_method.info == 'Retail-Outlet') ? paying.data.id : null
            response.phone_number = (payment_method.name == 'LINKAJA' || payment_method.name == 'OVO') ? phone_number : null
            response.isTransfer = false
            response.callback_id = (payment_method.info == 'Virtual-Account') ? paying.data.id : null

            return response

        }else if (payment_method.vendor === 'Dana') {
            input.total_price = amount
            input.invoice_number = external_id

            const paying = await this.danaService.order(input)

            response.invoice_url = paying.checkoutUrl
            response.isTransfer = false

            return response
        }else{
            return response
        }
    }

    async callback(payment: any){
        const getMethod = await this.methodService.getById(payment.method)

        switch(getMethod.vendor){
            case 'Xendit': return await this.xenditService.callback(payment, getMethod)

            case 'Dana': return await this.danaService.callback(payment)
        }
    }

    async xenditVACallback(input: any) {
        headerConfig.headers['X-CALLBACK-TOKEN'] = X_CALLBACK_TOKEN

        const body = {
            id: "57fb4e076fa3fa296b7f5a97",
            payment_id: "demo-1476087608948_1476087303080",
            callback_virtual_account_id: "57fb4df9af86ce19778ad359",
            owner_id: "57b4e5181473eeb61c11f9b9",
            external_id: "demo-1476087608948",
            account_number: "8808999939380502",
            bank_code: "BNI",
            amount: 99000,
            transaction_timestamp: "2016-10-10T08:15:03.080Z",
            merchant_code: "8808",
            sender_name: "JOHN DOE",
            updated: "2016-10-10T08:15:03.404Z",
            created: "2016-10-10T08:15:03.404Z"
        }

        const url = 'https://api.xendit.co/virtual_account_paid_callback_url'
        const paying = await this.http.post(url, body, headerConfig).toPromise()
    }

    async confirm(input: any) {
        var query = await this.orderModel.findOne({ _id: input.id, user_info: input.user_id, 'payment.external_id': input.exd })

        if(!query) throw new NotFoundException('order not found')

        if(query.status === 'PAID') throw new BadRequestException('this order has been PAID')

        query.payment.status = 'SUCCESS'
        query.status = 'PAID'

        await query.save()

        return 'ok'
    }
}
