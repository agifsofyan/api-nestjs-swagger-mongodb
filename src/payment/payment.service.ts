import { 
    Injectable,
    HttpService,
} from '@nestjs/common';
import {X_TOKEN} from 'src/config/configuration';

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
        private http: HttpService
    ) {}

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
