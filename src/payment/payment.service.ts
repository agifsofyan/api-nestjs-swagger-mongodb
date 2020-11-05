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
import { RandomStr, StrToUnix } from '../utils/optquery';

const baseUrl = 'https://api.xendit.co';
const headerConfig = {
    headers: { 
        'Authorization': `Basic ${X_TOKEN}`,
        'Content-Type': 'application/json'
    },
}

@Injectable()
export class PaymentService {
    constructor(
        @InjectModel('User') private userModel: Model<IUser>,
        private paService: PaymentAccountService,
        private http: HttpService
    ) {}

    async prepareToPay(input, userId, linkItems) {
        
        // const { payment_type, external_id, phone_number, retail_outlet_name, payment_code } = input
        const amount = input.total_price
        const method_id = input.payment.method
        
        const domain = process.env.DOMAIN
        
        const payment_type = await this.paService.getMethod(method_id)
        var external_id = `LX${payment_type.name}-${RandomStr(2)}`

        const user = await this.userModel.findById(userId)

        if(!user){
            throw new NotFoundException('user not found')
        }

        var body = {}
        var url: string

        /** Payment Service */
        switch(payment_type.info){
            /** Retail Outlet */
            case 'Retail-Outlet':
                body = {    
                    external_id: external_id,                                                        
                    retail_outlet_name: payment_type.name,
                    expected_amount: amount,
                    name: user.name
                }
                
                url = `${baseUrl}/fixed_payment_code`
                console.log('Retail-Outlet', body)
            break;

            /** EWallet */
            case 'EWallet':
                if(payment_type.name === 'OVO'){
                    if(!input.payment.phone_number){
                        throw new BadRequestException("Please insert phone number")
                    }

                    body = {
                        external_id: external_id,
                        amount: amount,
                        phone: input.payment.phone_number,
                        ewallet_type:"OVO"
                    }
                    console.log('OVO', body)
                }else if(payment_type.name === 'DANA'){
                    body = {
                        external_id: external_id,
                        amount: amount,
                        expiration_date: expiring(1),
                        callback_url:`${domain}/callbacks`,
                        redirect_url:`${domain}/home`,
                        ewallet_type:"DANA"
                    }
                    console.log('DANA', body)
                }else if(payment_type.name === 'LINKAJA'){
                    if(!input.payment.phone_number){
                        throw new BadRequestException("Please insert phone number")
                    }

                    body = {
                        external_id: external_id,
                        phone: input.payment.phone_number,
                        amount: amount,
                        items: linkItems,
                        callback_url: `${domain}/callbacks`,
                        redirect_url: "https://xendit.co/",
                        ewallet_type: "LINKAJA"
                    }
                    console.log('DANA', body)
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
                    expiration_date: expiring(1)
                }

                url = `${baseUrl}/callback_virtual_accounts`
                console.log('va:', body)
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
            var paying = await this.http.post(url, body, headerConfig).toPromise()

            console.log('paying', paying.data)
            return {
                external_id: external_id,
                status: (!paying.data.status) ? 'OK' : paying.data.status,
                message: (!paying.data.message) ? null : paying.data.message,
                invoice_url: (!paying.data.checkout_url) ? null : paying.data.checkout_url,
                payment_code: (payment_type.info == 'Retail-Outlet') ? paying.data.payment_code : null,
                pay_uid: (payment_type.info == 'Retail-Outlet') ? paying.data.id : null,
                phone_number: (payment_type.name == 'LINKAJA' || payment_type.name == 'OVO') ? input.payment.phone_number : null
            }
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

    async callback(payment){
        const { method, status, external_id, payment_code, pay_uid } = payment
        const payment_type = await this.paService.getMethod(method)
        const { name, info } = payment_type

        var url
        if(info === 'Virtual-Account'){
            url = `${baseUrl}/callback_virtual_account_payments/payment_id=${pay_uid}`
        }else if(info === 'Retail-Outlet'){
            url = `${baseUrl}/fixed_payment_code/${pay_uid}`
        }else if(info === 'EWallet'){
            url = `${baseUrl}/ewallets?external_id=${external_id}&ewallet_type=${name}`
        }

        try{
            var getPayout = await this.http.get(url, headerConfig).toPromise()
            return getPayout
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
