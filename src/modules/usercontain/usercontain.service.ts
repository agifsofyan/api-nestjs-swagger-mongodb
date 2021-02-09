import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUC } from './interfaces/usercontain.interface';

@Injectable()
export class UsercontainService {
    constructor(
		@InjectModel('UserContain') private readonly iucModel: Model<IUC>
	) {}

    async insert(input: any): Promise<IUC> {
        const query = new this.iucModel(input)
        await query.save()
        return query
    }
}
