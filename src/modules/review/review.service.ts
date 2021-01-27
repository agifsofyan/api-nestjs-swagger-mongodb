import { 
	Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IReview } from './interfaces/review.interface';

@Injectable()
export class ReviewService {
    constructor(
		@InjectModel('Review') private readonly reviewModel: Model<IReview>
    ) {}
    
    async create(input: any) {
		const query = new this.reviewModel(input);
		return await query.save();
	}
}
