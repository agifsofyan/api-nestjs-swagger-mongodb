import { 
    Injectable,
    HttpService,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
    UnauthorizedException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {X_TOKEN} from 'src/config/configuration';
import { PaymentMethodService } from './method/method.service';
import { IUser } from '../user/interfaces/user.interface';

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
        private pmService: PaymentMethodService,
        private http: HttpService
    ) {}

    async prepareToPay(input: any, userName: string, linkItems: any) {
        const domain = process.env.DOMAIN
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
                    method: {...payment_type},
                    status: (!paying.data.status) ? 'PENDING' : paying.data.status,
                    message: (!paying.data.message) ? null : paying.data.message,
                    invoice_url: (!paying.data.checkout_url) ? null : paying.data.checkout_url,
                    payment_code: (payment_type.info == 'Retail-Outlet') ? paying.data.payment_code : null,
                    pay_uid: (payment_type.info == 'Retail-Outlet') ? paying.data.id : null,
                    phone_number: (payment_type.name == 'LINKAJA' || payment_type.name == 'OVO') ? phone_number : null
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
        }else{
            return {
                external_id: external_id,
                method: {...payment_type},
                status: 'PENDING',
                message: null,
                invoice_url: null,
                payment_code: null,
                pay_uid: null,
                phone_number: null
            }
        }
    }

    async callback(payment: any){
        console.log('payment', payment)
        const { method, external_id, pay_uid } = payment
        const getMethod = await this.pmService.getById(method)
        const { name, info} = getMethod

        var url
        if(info === 'Virtual-Account'){
            url = `${baseUrl}/callback_virtual_account_payments/payment_id=${pay_uid}`
        }else if(info === 'Retail-Outlet'){
            url = `${baseUrl}/fixed_payment_code/${pay_uid}`
        }else if(info === 'EWallet'){
            url = `${baseUrl}/ewallets?external_id=${external_id}&ewallet_type=${name}`
        }

        try{
	        if(info === 'Virtual-Account'){
                return 'not yet active'
            }

            if(info === 'Bank-Transfer'){
                return 'PENDING'
            }
            
            const getPayout = await this.http.get(url, headerConfig).toPromise()
            return getPayout.data.status
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

    async multipleCallback(payment: any){
        
        var payment_type = new Array()
        var url = new Array()
        var getPayout = new Array()
        var status = new Array()

        for(let i in payment){
            payment_type[i] = payment[i].method

            if(payment_type[i].info === 'Virtual-Account'){
                url[i] = `${baseUrl}/callback_virtual_account_payments/payment_id=${payment[i].pay_uid}`
            }else if(payment_type[i].info === 'Retail-Outlet'){
                url[i] = `${baseUrl}/fixed_payment_code/${payment[i].pay_uid}`
            }else if(payment_type[i].info === 'EWallet'){
                url[i] = `${baseUrl}/ewallets?external_id=${payment[i].external_id}&ewallet_type=${payment_type[i].name}`
            }

            try{
                if(payment_type[i].info === 'Virtual-Account'){
                    status[i] = 'not yet active'
                }else{
                    getPayout[i] = await this.http.get(url[i], headerConfig).toPromise()
                    status[i] = getPayout[i].data
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
        return status
    }
}
