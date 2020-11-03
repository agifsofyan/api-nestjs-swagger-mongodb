import { 
    Injectable,
    HttpService,
    NotFoundException,
    BadRequestException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IPaymentAccount } from './interfaces/account.interface';
import { PaymentMethodService } from '../method/method.service';
import { X_TOKEN } from 'src/config/configuration';
import { expiring } from '../../utils/order';
import { IUser } from '../../user/interfaces/user.interface';
import { RandomStr } from '../../utils/optquery';

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
        @InjectModel('User') private readonly userModel: Model<IUser>,
        private http: HttpService,
        private pmService: PaymentMethodService
    ) {}

    async getMethod(payment_type: string) {
        const checkMethod = await this.pmService.getById(payment_type)
        
        if(checkMethod.statusCode == 400){
            throw new BadRequestException(checkMethod.message)
        }

        if(checkMethod.statusCode == 404){
            throw new NotFoundException(checkMethod.message)
        }

        return checkMethod
    }

    async getAccount(userId: string, payment_method_id: string) {
        var account
        try {
            account = await this.paModel.findOne({user_id: userId, payment_type: payment_method_id}).populate('payment_type')
        } catch (error) {
            throw new BadRequestException(`format payment_type_id:${payment_method_id} not valid`)
        }

        console.log('account', account)

        if(!account){
            throw new NotFoundException(`You don't have a payment account with that method`)
        }

        return account
    }
    
    async createVA(input: any, userId: string): Promise<any> {
        const checkMethod = await this.getMethod(input.payment_type)

        const body = {
            external_id: `XVA.${checkMethod.name}_${userId}`,
            bank_code: checkMethod.name,
            name: input.account_name
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
                account: await this.getAccount(userId, query.payment_type),
                status: va.status
            }
        }catch(err){
            throw new BadRequestException(err.response.data.message)
        }
    }

    async getVA(payment_method_id: string, userId: string): Promise<any> {
        const account = await this.getAccount(userId, payment_method_id)

		try{
            const url = `${baseUrl}/callback_virtual_accounts/${account.pa_id}`
            const xendit = await this.http.get(url, headerConfig).toPromise()

            return  {
                account: account,
                status:  xendit.data.status
            }
        }catch(err){
            throw new BadRequestException(err.response.data.message)
        }
    }

    async createRO(input: any, userId: string): Promise<any> {
        const checkMethod = await this.getMethod(input.payment_type)

        const body = {
            external_id: `XRO.${checkMethod.name}_${userId}`,
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

            const query = await new this.paModel(data)
            await query.save()

            return {
                account: await this.getAccount(userId, query.payment_type),
                status: x.status
            }
        }catch(err){
            throw new BadRequestException(err.response.data.message)
        }
    }

    async getRO(payment_method_id: string, userId: string): Promise<any> {
        const account = await this.getAccount(userId, payment_method_id)

		try{
            const url = `${baseUrl}/fixed_payment_code/${account.pa_id}`
            const xendit = await this.http.get(url, headerConfig).toPromise()
            
            return  {
                account: account,
                status:  xendit.data.status
            }
        }catch(err){
            throw new BadRequestException(err.response.data.message)
        }
    }

    async createEW(input: any, userId: string): Promise<any> {
        const checkMethod = await this.getMethod(input.payment_type)
        const body = {
            payment_type: input.payment_type,
            user_id: userId,
            external_id: `XEW.${checkMethod.name}_${userId}`,
            phone_number: input.phone_number,
            ewallet_type: checkMethod.name, 
            expiry: expiring
        }

		try{
            const query = await new this.paModel(body)
            await query.save()

            return  {
                account: await this.getAccount(userId, query.payment_type),
                status: 'active'
            }
        }catch(err){
            throw new BadRequestException(err.response.data.message)
        }
    }

    async getEW(payment_method_id: string, userId: string){
        try{
            const account = await this.getAccount(userId, payment_method_id)
            return  {
                account,
                status: 'active'
            }
        }catch(err){
            return err.response
        }
    }

    async switchStoreAccount(userId: string, payment_method: string, amount: number) {
        const checkMethod = await this.getMethod(payment_method)

        const user = await this.userModel.findById(userId)
        if(!user){
            throw new NotFoundException('user not found lho')
        }

        var body = {
            payment_type: payment_method,
            account_name: user.name,
            phone_number: user.phone_number,
            expected_amount: amount
        }

        var createPayAcc

        switch(checkMethod.info){
            case 'Retail-Outlet':
                console.log('before RO')
                createPayAcc = await this.createRO(body, userId)
                console.log('after RO')
            break;

            case 'EWallet':
                console.log('before EW')
                createPayAcc = await this.createEW(body, userId)
                console.log('after EW')
            break;

            // case 'VISA' || 'MASTERCARD' || 'JCB':
            //     createPayAcc = await this.createRO(input, user)
            // break;

            case 'Virtual-Account':
                console.log('before VA')
                createPayAcc =  await this.createVA(body, userId)
                console.log('after VA')
            break;
        }

        return createPayAcc
    }
}
