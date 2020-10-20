import { 
    Injectable, 
    BadRequestException, 
    NotFoundException,
    HttpService 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { ICreditCard } from './interfaces/payment.interface';

import {X_TOKEN} from '../config/configuration';

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
        @InjectModel('CreditCart') private readonly ccModel: Model<ICreditCard>,
        private http: HttpService
    ) {}

    async addPayment(user: any, ccDto: any): Promise<ICreditCard>{
        return null
    }

    async tokenization(user: any, ccDto: any): Promise<ICreditCard>{
		let userId = null
		if (user != null) {
			userId = user.userId
        }
        
        const res = await this.http.get(`${baseUrl}/v2/invoices`, {
			headers: {
				'Authorization': `Basic ${X_TOKEN}`
			}
		}).toPromise()

		return res.data
    }
    
    async createVN(user: any, ccDto: any): Promise<any> {
		try{
            const query = await this.http.post(`${baseUrl}/callback_virtual_accounts`, ccDto, headerConfig).toPromise()
            // console.log('resNow:', query)
            return query.data
        }catch(err){
            // console.log('errNow:', err)
            return err
        }
    }
}
