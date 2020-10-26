import { 
    Injectable,
    HttpService,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IPaymentAccount } from './interfaces/account.interface';
import { IPaymentMethod } from '../method/interfaces/payment.interface';
import { IUser } from '../../user/interfaces/user.interface';
import {X_TOKEN} from 'src/config/configuration';

const baseUrl = 'https://api.xendit.co';
const headerConfig = {
    headers: { 
        'Authorization': `Basic ${X_TOKEN}`,
        'Content-Type': 'application/json'
    },
}

@Injectable()
export class PaymentAccountService {
    constructor(
        @InjectModel('PaymentAccount') private readonly paModel: Model<IPaymentAccount>,
        @InjectModel('PaymentMethod') private readonly pmModel: Model<IPaymentMethod>,
        @InjectModel('User') private readonly UserModel: Model<IUser>,
        private http: HttpService
    ) {}
    
    async createVA(input: any, req: any): Promise<any> {
        var userId = req.user.userId

        const checkMethod = await this.pmModel.findById(input.payment_type)

        const body = {
            external_id: `XVA.${checkMethod.name}_${userId}`,
            bank_code: checkMethod.name,
            name: input.account_name,
            account_number: input.account_number
        }

        if(!checkMethod){
            throw new NotFoundException(`payment method with id ${input.payment_type} not found`)
        }

		try{
            const xendit = await this.http.post(`${baseUrl}/callback_virtual_accounts`, body, headerConfig).toPromise()
            const va = xendit.data

            const data = {
                pa_id: va.id,
                external_id: va.external_id,
                user_id: userId,
                bank_code: va.bank_code,
                account_name: va.name,
                account_number: va.account_number,
                expected_amount: va.expected_amount,
                expiry: va.expiration_date
            }

            // console.log(data)

            const query = await new this.paModel(data)
            await query.save()

            return query
        }catch(err){
            return err
        }
    }

    async getVA(payment_method_id: string, req: any): Promise<any> {
		try{
            var userId = req.user.userId

            const checkVA = await this.paModel.findOne({user_id: userId, payment_type: payment_method_id})
            const url = `${baseUrl}/callback_virtual_accounts/${checkVA.pa_id}`
            const xendit = await this.http.get(url, headerConfig).toPromise()
            return  {
                ... xendit.data,
                status:  xendit.data.status
            }
        }catch(err){
            return err
        }
    }

    async createRO(input: any, req: any): Promise<any> {
        var userId = req.user.userId
        input.external_id = `XRO.${input.retail_outlet_name}_${userId}`

        const checkMethod = await this.pmModel.findById(input.payment_type)
        if(!checkMethod){
            throw new NotFoundException(`payment method with id ${input.payment_type} not found`)
        }

		try{
            const xendit = await this.http.post(`${baseUrl}/fixed_payment_code`, input, headerConfig).toPromise()
            const x = xendit.data

            const data = {
                pa_id: x.id,
                external_id: x.external_id,
                retail_outlet_name: x.retail_outlet_name,
                user_id: userId,
                payment_code: x.payment_code,
                account_name: x.name,
                expected_amount: x.expected_amount,
                expiry: x.expiration_date
            }

            // console.log(data)

            const query = await new this.paModel(data)
            await query.save()

            return query
        }catch(err){
            return err
        }
    }

    async getRO(payment_method_id: string, req: any): Promise<any> {
		try{
            var userId = req.user.userId

            const checkVA = await this.paModel.findOne({user_id: userId, payment_type: payment_method_id})
            const url = `${baseUrl}/fixed_payment_code/${checkVA.pa_id}`
            const xendit = await this.http.get(url, headerConfig).toPromise()
            return  {
                ... xendit.data,
                status:  xendit.data.status
            }
        }catch(err){
            return err
        }
    }
}
