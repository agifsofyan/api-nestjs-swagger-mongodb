import { 
    Injectable,
    HttpService,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IVirtualAccount as IVA } from './interfaces/va.interface';
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
export class VaService {
    constructor(
        @InjectModel('VA') private readonly vaModel: Model<IVA>,
        @InjectModel('User') private readonly UserModel: Model<IUser>,
        private http: HttpService
    ) {}
    
    async createVA(input: any, req: any): Promise<any> {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var userId = req.user.userId
        input.external_id = `XVA.${input.bank_code}_${userId}`

		try{
            const xendit = await this.http.post(`${baseUrl}/callback_virtual_accounts`, input, headerConfig).toPromise()
            const va = xendit.data

            const data = {
                ...va,
                ip: ip,
                va_id: va.id,
                user_id: userId,
                // status: va.status
            }

            // console.log(data)

            const query = await new this.vaModel(data)
            await query.save()

            return query
        }catch(err){
            return err
        }
    }

    async getVA(req: any): Promise<any> {
		try{
            var userId = req.user.userId

            const checkVA = await this.vaModel.findOne({user_id: userId})
            const url = `${baseUrl}/callback_virtual_accounts/${checkVA.va_id}`
            const xendit = await this.http.get(url, headerConfig).toPromise()
            return  {
                ... xendit.data,
                status:  xendit.data.status
            }
        }catch(err){
            return err
        }
    }

    async simulate_payment(external_id: string, amount: number): Promise<any> {
		try{
            const url = `${baseUrl}/callback_virtual_accounts/external_id=${external_id}/simulate_payment`
            const data = { "amount": amount }
            return await this.http.post(url, data, headerConfig).toPromise()
        }catch(err){
            return err
        }
    }
}
