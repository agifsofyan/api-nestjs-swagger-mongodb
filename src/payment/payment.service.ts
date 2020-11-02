import { 
    Injectable,
    HttpService,
} from '@nestjs/common';
import {X_TOKEN} from 'src/config/configuration';
import { PaymentAccountService } from './account/account.service';
import { expiring } from '../utils/order';

const baseUrl = 'https://api.xendit.co';
const headerConfig = {
    headers: { 
        'Authorization': `Basic ${X_TOKEN}`,
        'Content-Type': 'application/json'
    },
}

const unixTime = Math.floor(Date.now() / 1000);
const duration = (31 * 3600 * 24)
const expired =  unixTime + duration
const expDate = new Date(expired * 1000)

@Injectable()
export class PaymentService {
    constructor(
        private paService: PaymentAccountService,
        private http: HttpService
    ) {}

    async preparePay (input: any, amount: number, linkItems: any) {
        const method = await this.paService.getMethod(input.payment_account.payment_type)
        
        console.log('input', input)
        const external_id = input.payment_account.external_id
        const phone = input.payment_account.phone_number
        const domain = process.env.DOMAIN
        var body = {}
        var url: string

        console.log('method', method)

        /** Payment Service */
        switch(method.name){
            case 'INDOMARET' && 'ALFAMART':
                url = `${baseUrl}/fixed_payment_code/simulate_payment`

                body = {          
                    external_id: external_id,                                                                                    
                    retail_outlet_name: input.payment_account.retail_outlet_name,
                    transfer_amount: amount
                }

                console.log('body alfa', body)
            break;

            case 'OVO':
                url = `${baseUrl}/ewallets`

                body = {
                    external_id: external_id,
                    amount: amount,
                    phone: phone,
                    ewallet_type:"OVO"
                }
                console.log('body ovo', body)
            break;

            case 'DANA':
                url = `${baseUrl}/ewallets`

                body = {
                    external_id: external_id,
                    amount: amount,
                    expiration_date: expiring,
                    callback_url:`${domain}/callbacks`,
                    redirect_url:`${domain}/home`,
                    ewallet_type:"DANA"
                }
                console.log('body dana', body)
            break;

            case 'LINKAJA':
                url = `${baseUrl}/ewallets`

                body = {
                    external_id: external_id,
                    phone: phone,
                    amount: amount,
                    items: linkItems,
                    callback_url: `${domain}/callbacks`,
                    redirect_url: "https://xendit.co/",
                    ewallet_type: "LINKAJA"
                }
                console.log('body linkaja', body)
            break;

            case 'VISA' && 'MASTERCARD' && 'JCB':
                url = `${baseUrl}/credit_card_charges`

                body = {
                    token_id : "5caf29f7d3c9b11b9fa09c96",
                    external_id: external_id,
                    amount: amount
                }
            break;

            default:
                url = `${baseUrl}/callback_virtual_accounts/external_id=${external_id}/simulate_payment`

                body = {
                    external_id: external_id,
                    amount: amount,
                    expiration_date: expiring
                }
        }

        console.log('body last', body)

        try{
            const paying = await this.http.post(url, body, headerConfig).toPromise()
            return paying.data.data
        }catch(err){
            return err.response.data
        }
    }

    async pay(payment_type: string, input: any): Promise<any> {
        const external_id = input.external_id
        const amount = input.amount
        const phone = input.phone_number
        var url = `${baseUrl}/callback_virtual_accounts/external_id=${external_id}/simulate_payment`

        var body = {}

        switch(payment_type){
            case 'ALFAMART' || 'INDOMARET':
                url = `${baseUrl}/fixed_payment_code/simulate_payment`

                body = {
                    retail_outlet_name: input.retail_outlet_name,
                    payment_code: input.payment_code,
                    transfer_amount: amount
                }
            break;

            case 'OVO':
                url = `${baseUrl}/ewallets`

                body = {
                    external_id: external_id,
                    amount: amount,
                    phone: phone,
                    ewallet_type:"OVO"
                }
            break;

            case 'DANA':
                url = `${baseUrl}/ewallets`
            break;

            case 'LINKAJA':
                url = `${baseUrl}/ewallets`
            break;

            case 'VISA' || 'MASTERCARD' || 'JCB':
                url = `${baseUrl}/credit_card_charges`
            break;

            default:
                url = url
        }

		try{
            const data = { "amount": amount, expiration_date: expDate }
            return await this.http.post(url, data, headerConfig).toPromise()
        }catch(err){
            return err
        }
    }
}
