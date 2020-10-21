import { 
    Injectable,
    HttpService 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IVirtualAccount as IVA } from './interfaces/va.interface';

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
        @InjectModel('VA') private readonly ccModel: Model<IVA>,
        private http: HttpService
    ) {}
    
    async createVA(user: any, input: any): Promise<any> {
		try{
            const query = await this.http.post(`${baseUrl}/callback_virtual_accounts`, input, headerConfig).toPromise()
            // console.log('resNow:', query)
            return query.data
        }catch(err){
            // console.log('errNow:', err)
            return err
        }
    }
}
