import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IGamification } from './interfaces/gamification.interface';
import { OptQuery } from 'src/utils/OptQuery';
import { IContent } from '../content/interfaces/content.interface';
import { IProduct } from '../product/interfaces/product.interface';
import { StrToUnix } from 'src/utils/StringManipulation';
import { RatingService } from '../rating/rating.service';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class GamificationService {
    constructor(
		@InjectModel('Gamification') private readonly gameModel: Model<IGamification>
	) {}

    async create(input: any): Promise<IGamification> {
		return null
	}
}
