import { 
    BadRequestException,
    Injectable, NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IPaymentMethod as IPM } from './interfaces/payment.interface';

@Injectable()
export class PaymentMethodService {
    constructor(
        @InjectModel('PaymentMethod') private readonly payMethodModel: Model<IPM>
    ) {}

    async insert(input: any){
        const checkPM = await this.payMethodModel.findOne({ name: input.name })

        if(checkPM){
            throw new BadRequestException('method name is already exists')
        }

        const query = new this.payMethodModel(input)

        await query.save()

        return query
    }

    async getAll(){
        return await this.payMethodModel.find()
    }

    async getByName(input: any){
        const query = await this.payMethodModel.findOne({ name: input })

        if(!query){
            throw new NotFoundException(`payment method with name ${input} not found`)
        }

        return query
    }
}
