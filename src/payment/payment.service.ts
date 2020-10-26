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

    async simulate_payment(external_id: string, amount: number): Promise<any> {
		try{
            const url = `${baseUrl}/callback_virtual_accounts/external_id=${external_id}/simulate_payment`
            const data = { "amount": amount, expiration_date: expDate }
            return await this.http.post(url, data, headerConfig).toPromise()
        }catch(err){
            return err
        }
    }
}
