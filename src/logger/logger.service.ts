import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { ILogger } from './interfaces/logger.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class LoggerService {
    constructor(
		@InjectModel('Logger') private readonly loggerModel: Model<ILogger>
    ) {}
    
    async store(input){
        try {
            const query = new this.loggerModel(input)
            await query.save()
            return query
        } catch (error) {
            throw new NotImplementedException(error)
        }
    }

    async findAll() {
        try {
            return await this.loggerModel.find()
        } catch (error) {
            throw new NotImplementedException(error)
        }
    }
}
