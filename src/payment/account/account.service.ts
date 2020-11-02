import { 
    Injectable,
    HttpService,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IPaymentAccount } from './interfaces/account.interface';
import { PaymentMethodService } from '../method/method.service';
import { IUser } from '../../user/interfaces/user.interface';
import { X_TOKEN } from 'src/config/configuration';
import { expiring } from '../../utils/order';

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
        @InjectModel('User') private readonly UserModel: Model<IUser>,
        private http: HttpService,
        private pmService: PaymentMethodService
    ) {}
    
    async createVA(input: any, req: any): Promise<any> {
        var userId = req.user.userId

        const checkMethod = await this.pmService.getById(input.payment_type)

        const body = {
            external_id: `XVA.${checkMethod.name}_${userId}`,
            bank_code: checkMethod.name,
            name: input.account_name,
            account_number: input.account_number
        }

        if(!checkMethod){
            throw new NotFoundException(`payment type with id ${input.payment_type} not found`)
        }

		try{
            const xendit = await this.http.post(`${baseUrl}/callback_virtual_accounts`, body, headerConfig).toPromise()
            const va = xendit.data

            const data = {
                payment_type: input.payment_type,
                pa_id: va.id,
                external_id: va.external_id,
                user_id: userId,
                bank_code: va.bank_code,
                account_name: va.name,
                account_number: va.account_number,
                expected_amount: va.expected_amount,
                expiry: va.expiration_date
            }

            const query = await new this.paModel(data)
            await query.save()

            return {
                payment_account: query,
                payment_status: va.status
            }
        }catch(err){
            return err
        }
    }

    async getVA(payment_method_id: string, req: any): Promise<any> {
        var userId = req.user.userId

        const checkVA = await this.paModel.findOne({user_id: userId, payment_type: payment_method_id}).populate('payment_type')

        if(!checkVA){
            throw new NotFoundException(`payment account with user_id:${userId} & payment_type_id:${payment_method_id} not found`)
        }

		try{
            const url = `${baseUrl}/callback_virtual_accounts/${checkVA.pa_id}`
            const xendit = await this.http.get(url, headerConfig).toPromise()

            return  {
                payment_account: checkVA,
                payment_status:  xendit.data.status
            }
        }catch(err){
            return err
        }
    }

    async createRO(input: any, req: any): Promise<any> {
        var userId = req.user.userId
        const external_id = `XRO.${input.retail_outlet_name}_${userId}`

        const checkMethod = await this.pmService.getById(input.payment_type)
        if(!checkMethod){
            throw new NotFoundException(`payment type with id ${input.payment_type} not found`)
        }

        const body = {
            external_id: external_id,
            retail_outlet_name: checkMethod.name,
            name: input.account_name,
            expected_amount: input.expected_amount
        }

		try{
            const xendit = await this.http.post(`${baseUrl}/fixed_payment_code`, body, headerConfig).toPromise()
            const x = xendit.data

            const data = {
                payment_type: input.payment_type,
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

            return {
                payment_account: query,
                payment_status: x.status
            }
        }catch(err){
            return err
        }
    }

    async getRO(payment_method_id: string, req: any): Promise<any> {
        var userId = req.user.userId

        const checkVA = await this.paModel.findOne({user_id: userId, payment_type: payment_method_id}).populate('payment_type')

        if(!checkVA){
            throw new NotFoundException(`payment account with user_id:${userId} & payment_type_id:${payment_method_id} not found`)
        }

		try{
            const url = `${baseUrl}/fixed_payment_code/${checkVA.pa_id}`
            const xendit = await this.http.get(url, headerConfig).toPromise()
            
            return  {
                payment_account: checkVA,
                payment_status:  xendit.data.status
            }
        }catch(err){
            return err
        }
    }

    async createEW(input: any, req: any): Promise<any> {
        var userId = req.user.userId
        
        const checkMethod = await this.pmService.getById(input.payment_type)
        if(!checkMethod){
            throw new NotFoundException(`payment type with id ${input.payment_type} not found`)
        }

        const body = {
            payment_type: input.payment_type,
            user_id: userId,
            external_id: `XEW.${checkMethod.name}_${userId}`,
            phone_number: input.phone_number,
            expiry: expiring
        }

		try{
            const query = await new this.paModel(body)
            await query.save()

            return query
        }catch(err){
            return err
        }
    }

    async getEW(payment_method_id: string, req: any): Promise<any> {
        var userId = req.user.userId
		try{
            const query = await this.paModel.findOne({user_id: userId, payment_type: payment_method_id}).populate('payment_type')
    
            if(!query){
                throw new NotFoundException(`payment account with user_id:${userId} & payment_type_id:${payment_method_id} not found`)
            }

            return query
        }catch(err){
            return err
        }
    }

}
