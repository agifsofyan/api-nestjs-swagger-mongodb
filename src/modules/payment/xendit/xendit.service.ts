import { 
    BadRequestException, 
    HttpService, 
    Injectable, 
    InternalServerErrorException, 
    NotFoundException, 
    UnauthorizedException 
} from "@nestjs/common";
import { AxiosResponse } from "axios";
import { X_TOKEN, X_CALLBACK_TOKEN } from 'src/config/configuration';

const baseUrl = 'https://api.xendit.co';
var headerConfig:any = {
    headers: { 
        'Authorization': `Basic ${X_TOKEN}`,
        'Content-Type': 'application/json'
    },
}

@Injectable()
export class XenditService {
    constructor(private http: HttpService) {}

    async createOrder(input: any, userName: string, linkItems: any, payment_method: any): Promise<AxiosResponse<any>> {
        const domain = process.env.BACKOFFICE
        const { amount, external_id, expired, phone_number } = input

        var body = {}
        var url: string

        /** Xendit Payment Service */
        switch(payment_method.info){
            /** Retail Outlet */
            case 'Retail-Outlet':
                body = {    
                    external_id: external_id,                                                        
                    retail_outlet_name: payment_method.name,
                    expected_amount: amount,
                    name: userName
                }
                
                url = `${baseUrl}/fixed_payment_code`
            break;

            /** EWallet */
            case 'EWallet':
                if(payment_method.name === 'OVO'){
                    if(!phone_number){
                        throw new BadRequestException("payment.phone_number is required")
                    }

                    body = {
                        external_id: external_id,
                        amount: amount,
                        phone: phone_number,
                        ewallet_type:"OVO"
                    }
                }else if(payment_method.name === 'DANA'){
                    body = {
                        external_id: external_id,
                        amount: amount,
                        expiration_date: expired,
                        callback_url:`${domain}/callbacks`,
                        redirect_url:`${domain}/home`,
                        ewallet_type:"DANA"
                    }
                }else if(payment_method.name === 'LINKAJA'){
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
                    bank_code: payment_method.name,
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
            return await this.http.post(url, body, headerConfig).toPromise()
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
    }

    async callback(payment: any, method: any){
        const { external_id, pay_uid } = payment
        const { name, info} = method

        var url

        switch(info){
            case 'Retail-Outlet':
                url = `${baseUrl}/fixed_payment_code/${pay_uid}`
            break;

            case 'EWallet':
                url = `${baseUrl}/ewallets?external_id=${external_id}&ewallet_type=${name}`
            break;
            
            case 'Virtual-Account':
                // url = ''
                return 'Xendit Vrtual Account are not ready'
            break;
        }
        
        try{
            const xenditCallback = await this.http.get(url, headerConfig).toPromise()
            const xenditStatus = xenditCallback.data.status

            var status
            if (
                xenditStatus === 'COMPLETED' || 
                xenditStatus === 'PAID' || 
                xenditStatus === 'SUCCESS_COMPLETED' || 
                xenditStatus === 'SETTLEMENT'
            ){
                status = "PAID"
            }else if(
                xenditStatus === 'EXPIRED' || 
                xenditStatus === 'expire'
            ){
                status = 'EXPIRED'
            }else{
                status = xenditStatus
            }

            return status
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
