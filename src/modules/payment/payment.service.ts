import { 
    Injectable,
    HttpService,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
    UnauthorizedException
} from '@nestjs/common';
import { X_TOKEN, X_CALLBACK_TOKEN } from 'src/config/configuration';
import { DanaService } from '../dana/dana.service';
import { PaymentMethodService } from './method/method.service';

const baseUrl = 'https://api.xendit.co';
var headerConfig:any = {
    headers: { 
        'Authorization': `Basic ${X_TOKEN}`,
        'Content-Type': 'application/json'
    },
}

@Injectable()
export class PaymentService {
    constructor(
        private pmService: PaymentMethodService,
        private http: HttpService,
        private danaService: DanaService
    ) {}

    async prepareToPay(input: any, userName: string, linkItems: any) {
        const domain = process.env.BACKOFFICE
        const { amount, method_id, external_id, expired, phone_number } = input
        
        const payment_type = await this.pmService.getById(method_id)

        var body = {}
        var url: string
        if(payment_type.vendor === 'Xendit'){

            /** Payment Service */
            switch(payment_type.info){
                /** Retail Outlet */
                case 'Retail-Outlet':
                    body = {    
                        external_id: external_id,                                                        
                        retail_outlet_name: payment_type.name,
                        expected_amount: amount,
                        name: userName
                    }
                    
                    url = `${baseUrl}/fixed_payment_code`
                break;

                /** EWallet */
                case 'EWallet':
                    if(payment_type.name === 'OVO'){
                        if(!phone_number){
                            throw new BadRequestException("payment.phone_number is required")
                        }

                        body = {
                            external_id: external_id,
                            amount: amount,
                            phone: phone_number,
                            ewallet_type:"OVO"
                        }
                    }else if(payment_type.name === 'DANA'){
                        body = {
                            external_id: external_id,
                            amount: amount,
                            expiration_date: expired,
                            callback_url:`${domain}/callbacks`,
                            redirect_url:`${domain}/home`,
                            ewallet_type:"DANA"
                        }
                    }else if(payment_type.name === 'LINKAJA'){
                        if(!phone_number){
                            throw new BadRequestException("Please insert phone number")
                        }

                        body = {
                            external_id: external_id,
                            phone: phone_number,
                            amount: amount,
                            items: linkItems,
                            callback_url: `${domain}/callbacks`,
                            redirect_url: "https://xendit.co/",
                            ewallet_type: "LINKAJA"
                        }
                    }

                    url = `${baseUrl}/ewallets`
                break;

                /** Virtual Account */
                case 'Virtual-Account':
                    body = {
                        external_id: external_id,
                        bank_code: payment_type.name,
                        name: 'LARUNO',
                        expected_amount: amount,
                        is_closed: true,
                        is_single_use: true,
                        expiration_date: expired
                    }

                    url = `${baseUrl}/callback_virtual_accounts`
                break;

                /** Credit Card */
                case 'Credit-Card':
                    
                    body = {
                        token_id : "5caf29f7d3c9b11b9fa09c96",
                        external_id: external_id,
                        amount: amount
                    }

                    url = `${baseUrl}/credit_card_charges`
                break;
            }

            try{
                const paying = await this.http.post(url, body, headerConfig).toPromise()

                return {
                    external_id: external_id,
                    method: payment_type,
                    status: (!paying.data.status) ? 'UNPAID' : paying.data.status,
                    message: (!paying.data.message) ? null : paying.data.message,
                    invoice_url: (!paying.data.checkout_url) ? null : paying.data.checkout_url,
                    payment_code: (payment_type.info == 'Retail-Outlet') ? paying.data.payment_code : null,
                    pay_uid: (payment_type.info == 'Retail-Outlet') ? paying.data.id : null,
                    phone_number: (payment_type.name == 'LINKAJA' || payment_type.name == 'OVO') ? phone_number : null,
                    isTransfer: false,
                    callback_id: (payment_type.info == 'Virtual-Account') ? paying.data.id : null
                }
            }catch(err){
                const e = err.response
                if(e.status === 400){
                    throw new BadRequestException(e.data)
                }else if(e.status === 401){
                    throw new UnauthorizedException(e.data)
                }else if(e.status === 404){
                    throw new NotFoundException(e.data)
                }else{
                    throw new InternalServerErrorException
                }
            }
        }else if (payment_type.vendor === 'Dana Indonesia') {
            const input = {
                total_price: amount
            }
            const paying = await this.danaService.order(input)

            return {
                external_id: external_id,
                method: payment_type,
                status: 'UNPAID',
                message: null,
                invoice_url: paying.checkoutUrl,
                payment_code: null,
                pay_uid: null,
                phone_number: null,
                isTransfer: true
            }
        }else{
            // Payment Method is Laruno
            return {
                external_id: external_id,
                method: payment_type,
                status: 'UNPAID',
                message: null,
                invoice_url: null,
                payment_code: null,
                pay_uid: null,
                phone_number: null,
                isTransfer: true
            }
        }
    }

    async callback(payment: any){
        //console.log('payment', payment)
        const { method, external_id, pay_uid } = payment
        const getMethod = await this.pmService.getById(method)
        const { name, info, vendor} = getMethod

        var url
        if(info === 'Virtual-Account'){
            // url = `${baseUrl}/callback_virtual_account_payments/payment_id=${pay_uid}`
            return 'Xendit Vrtual Account are not ready'

        }else if(info === 'Retail-Outlet'){
            url = `${baseUrl}/fixed_payment_code/${pay_uid}`
        }else if(info === 'EWallet'){
            url = `${baseUrl}/ewallets?external_id=${external_id}&ewallet_type=${name}`

            // if(vendor === 'Dana Indonesia'){
            //     url = `${baseUrl}/callback_virtual_account_payments/payment_id=${pay_uid}`
            // }
            if(vendor === 'Dana Indonesia'){
                return 'Dana Indonesian are not ready'
            }
        }else if(info === 'Bank-Transfer'){
            return 'UNPAID'
        }else{
            try{
                const getPayout = await this.http.get(url, headerConfig).toPromise()
                // console.log('getPayout', getPayout)
                return getPayout.data.status
            }catch(err){
                const e = err.response
                // console.log('error', e)
                if(e.status === 404){
                    throw new NotFoundException(e.data.message)
                }else if(e.status === 400){
                    throw new BadRequestException(e.data.message)
                }else{
                    throw new InternalServerErrorException
                }
            }
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
}
