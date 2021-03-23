import { 
	Injectable
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
// import { ISales } from '../interfaces/sales.interface';

@Injectable()
export class SalesService {
    // constructor(
	// 	@InjectModel('Sales') private readonly utmModel: Model<ISales>,
	// ) {}
}
