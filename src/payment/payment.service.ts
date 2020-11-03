import { 
    Injectable,
    HttpService,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {X_TOKEN} from 'src/config/configuration';
import { PaymentAccountService } from './account/account.service';
import { expiring } from '../utils/order';
import { IUser } from '../user/interfaces/user.interface';

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
        @InjectModel('User') private userModel: Model<IUser>,
        private paService: PaymentAccountService,
        private http: HttpService
    ) {}

    async pay (payment: any, amount: number, linkItems: any) {
        console.log('payment_account', payment)
        
        const { payment_type, external_id, phone_number, retail_outlet_name, payment_code } = payment

        const domain = process.env.DOMAIN

        const pm = await this.paService.getMethod(payment_type._id)
        console.log('pm', pm)

        var body = {}
        var url: string

        console.log('linkItems', linkItems)

        // console.log('method', method)

        /** Payment Service */
        switch(payment_type.info){
            /** Retail Outlet */
            case 'Retail-Outlet':
                url = `${baseUrl}/fixed_payment_code/simulate_payment`

                body = {                                                                   
                    retail_outlet_name: retail_outlet_name,
                    payment_code: payment_code,
                    transfer_amount: amount
                }
                console.log('Retail-Outlet', body)
            break;

            /** EWallet */
            case 'EWallet':
                url = `${baseUrl}/ewallets`

                if(payment_type.name === 'OVO'){
                    body = {
                        external_id: external_id,
                        amount: amount,
                        phone: phone_number,
                        ewallet_type:"OVO"
                    }
                    console.log('OVO', body)
                }else if(payment_type.name === 'DANA'){
                    body = {
                        external_id: external_id,
                        amount: amount,
                        expiration_date: expiring,
                        callback_url:`${domain}/callbacks`,
                        redirect_url:`${domain}/home`,
                        ewallet_type:"DANA"
                    }
                    console.log('DANA', body)
                }else if(payment_type.name === 'LINKAJA'){
                    body = {
                        external_id: external_id,
                        phone: phone_number,
                        amount: amount,
                        items: linkItems,
                        callback_url: `${domain}/callbacks`,
                        redirect_url: "https://xendit.co/",
                        ewallet_type: "LINKAJA"
                    }
                    console.log('LINKAJA', body)
                }

                console.log('EWallet', body)
            break;

            /** Virtual Account */
            case 'Virtual-Account':
                url = `${baseUrl}/callback_virtual_accounts/external_id=${external_id}/simulate_payment`

                body = {
                    external_id: external_id,
                    amount: amount,
                    expiration_date: expiring
                }
                console.log('Virtual-Account', body)
            break;

            /** Credit Card */
            case 'Credit-Card':
                url = `${baseUrl}/credit_card_charges`

                body = {
                    token_id : "5caf29f7d3c9b11b9fa09c96",
                    external_id: external_id,
                    amount: amount
                }
                console.log('Credit-Card', body)
            break;
        }

        console.log('body last', body)

        try{
            const paying = await this.http.post(url, body, headerConfig).toPromise()
            return paying.data
        }catch(err){
            const e = err.response
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
