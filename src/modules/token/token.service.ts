import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IToken } from './interfaces/token.interface';

@Injectable()
export class TokenService {
    constructor(@InjectModel('Token') private tokenModel: Model<IToken>) { }

    async store(input: any): Promise<IToken> {
        const query = new this.tokenModel(input)
        query.save()
        return query
    }
}